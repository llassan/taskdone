const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

// Common skills database for matching
const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express', 'python', 'django', 'flask',
  'java', 'spring', 'kotlin', 'swift', 'flutter', 'dart', 'go', 'rust', 'c++', 'c#', '.net',
  'php', 'laravel', 'ruby', 'rails', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux', 'html', 'css', 'tailwind', 'bootstrap',
  'figma', 'photoshop', 'illustrator', 'sketch', 'ui/ux', 'ux design', 'ui design',
  'machine learning', 'deep learning', 'data science', 'data analysis', 'tensorflow', 'pytorch',
  'power bi', 'tableau', 'excel', 'sap', 'salesforce', 'tally', 'accounting',
  'digital marketing', 'seo', 'sem', 'google ads', 'facebook ads', 'content writing', 'copywriting',
  'project management', 'agile', 'scrum', 'jira', 'confluence',
  'communication', 'leadership', 'teamwork', 'problem solving',
  'autocad', 'solidworks', 'matlab', 'embedded systems', 'iot',
  'android', 'ios', 'react native', 'next.js', 'graphql', 'rest api',
  'wordpress', 'shopify', 'wix',
];

const INDIAN_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune',
  'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'noida', 'gurgaon', 'gurugram',
  'indore', 'bhopal', 'nagpur', 'coimbatore', 'kochi', 'trivandrum', 'thiruvananthapuram',
  'visakhapatnam', 'vadodara', 'surat', 'patna', 'ranchi', 'dehradun', 'mysore', 'mangalore',
  'remote', 'work from home', 'wfh',
];

const EDUCATION_KEYWORDS = {
  'b.tech': 'B.Tech', 'btech': 'B.Tech', 'b.e': 'B.E', 'bachelor of technology': 'B.Tech',
  'bachelor of engineering': 'B.E', 'b.sc': 'B.Sc', 'bsc': 'B.Sc', 'bachelor of science': 'B.Sc',
  'bca': 'BCA', 'b.c.a': 'BCA', 'bba': 'BBA', 'b.b.a': 'BBA',
  'b.com': 'B.Com', 'bcom': 'B.Com', 'bachelor of commerce': 'B.Com',
  'mba': 'MBA', 'm.b.a': 'MBA', 'mca': 'MCA', 'm.c.a': 'MCA',
  'm.tech': 'M.Tech', 'mtech': 'M.Tech', 'm.sc': 'M.Sc', 'msc': 'M.Sc',
  'diploma': 'Diploma', 'phd': 'PhD', 'ph.d': 'PhD',
  '12th': '12th', 'hsc': '12th', '10th': '10th', 'ssc': '10th',
};

const ROLE_KEYWORDS = [
  'software engineer', 'software developer', 'web developer', 'frontend developer', 'backend developer',
  'full stack developer', 'fullstack developer', 'mobile developer', 'android developer', 'ios developer',
  'data scientist', 'data analyst', 'data engineer', 'ml engineer', 'machine learning engineer',
  'devops engineer', 'cloud engineer', 'sre', 'system administrator',
  'ui/ux designer', 'ux designer', 'ui designer', 'graphic designer', 'product designer',
  'product manager', 'project manager', 'business analyst', 'scrum master',
  'digital marketing', 'seo specialist', 'content writer', 'social media manager',
  'sales executive', 'business development', 'account manager', 'hr executive',
  'mechanical engineer', 'electrical engineer', 'civil engineer', 'chemical engineer',
  'intern', 'trainee', 'fresher', 'associate', 'analyst', 'consultant',
  'qa engineer', 'test engineer', 'automation engineer',
];

async function extractTextFromBuffer(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf') {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Plain text
  return buffer.toString('utf-8');
}

function extractEmail(text) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match ? match[0] : '';
}

function extractPhone(text) {
  const match = text.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/);
  return match ? match[0].replace(/[\s-]/g, '') : '';
}

function extractName(text) {
  // First non-empty line is usually the name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If it looks like a name (2-4 words, no special chars besides spaces)
    if (/^[A-Za-z\s.]{2,50}$/.test(firstLine) && firstLine.split(/\s+/).length <= 5) {
      return firstLine;
    }
  }
  return '';
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const skill of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }
  return [...new Set(found)].slice(0, 15);
}

function extractLocations(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const city of INDIAN_CITIES) {
    if (lower.includes(city)) {
      found.push(city.charAt(0).toUpperCase() + city.slice(1));
    }
  }
  return [...new Set(found)].slice(0, 5);
}

function extractEducation(text) {
  const lower = text.toLowerCase();
  for (const [keyword, label] of Object.entries(EDUCATION_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return label;
    }
  }
  return '';
}

function extractCollege(text) {
  const patterns = [
    /(?:university|institute|college|school|iit|nit|iiit|bits|vit|srm|manipal|amity|lovely|sharda)[\w\s,.-]{3,60}/gi,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim().slice(0, 80);
  }
  return '';
}

function extractExperience(text) {
  const lower = text.toLowerCase();

  if (/\bfresher\b|\b0\s*(?:years?|yrs?)\b|\bno experience\b/i.test(lower)) return 'fresher';

  const match = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/);
  if (match) {
    const years = parseInt(match[1]);
    if (years === 0) return 'fresher';
    if (years <= 1) return '0-1';
    if (years <= 3) return '1-3';
    if (years <= 5) return '3-5';
    if (years <= 10) return '5-10';
    return '10+';
  }

  return 'fresher';
}

function extractRoles(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const role of ROLE_KEYWORDS) {
    if (lower.includes(role)) {
      found.push(role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }
  return [...new Set(found)].slice(0, 5);
}

function extractLinkedin(text) {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  return match ? (match[0].startsWith('http') ? match[0] : `https://${match[0]}`) : '';
}

function extractSalary(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lacs?)\s*(?:per\s*annum)?/i);
  if (match) return match[1];

  const ctcMatch = text.match(/ctc[:\s]*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|l)/i);
  if (ctcMatch) return ctcMatch[1];

  return '';
}

async function parseResume(buffer, filename) {
  const text = await extractTextFromBuffer(buffer, filename);

  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    college: extractCollege(text),
    preferredRoles: extractRoles(text),
    preferredLocations: extractLocations(text),
    linkedinUrl: extractLinkedin(text),
    expectedSalary: extractSalary(text),
    headline: '', // Will be generated from education + skills
    rawText: text.slice(0, 5000), // Keep first 5000 chars for reference
  };
}

module.exports = { parseResume };
