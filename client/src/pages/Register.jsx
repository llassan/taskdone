import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCheckSquare, FiUser, FiMail, FiLock, FiPhone, FiUpload, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'client';

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('fresher');
  const [skills, setSkills] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const fileInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const prefix = `/${lang || 'en'}`;

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setResumeFileName(file.name);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/user/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;

      // Auto-fill all fields
      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.experience) setExperience(data.experience);
      if (data.skills?.length) setSkills(data.skills.join(', '));
      if (data.preferredRoles?.length) setPreferredRoles(data.preferredRoles.join(', '));
      if (data.preferredLocations?.length) setPreferredLocations(data.preferredLocations.join(', '));

      setResumeParsed(true);
      toast.success(t('auth.resumeParsed'));
    } catch {
      toast.error(t('auth.resumeError'));
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        name, email, phone, password, role, experience,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        preferredRoles: preferredRoles ? preferredRoles.split(',').map(s => s.trim()) : [],
        preferredLocations: preferredLocations ? preferredLocations.split(',').map(s => s.trim()) : [],
      });
      toast.success(role === 'worker' ? 'Welcome, worker!' : 'Welcome! Let\'s get you interviews.');
      navigate(role === 'worker' ? `${prefix}/worker` : `${prefix}/onboarding`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link to={`${prefix}/`} className="inline-flex items-center gap-2 text-2xl font-bold text-emerald-600">
            <FiCheckSquare /> {t('brand')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {role === 'worker' ? t('auth.joinWorker') : t('auth.createAccount')}
          </h1>
          <p className="text-gray-500 mt-1">
            {role === 'worker' ? t('auth.joinWorkerSubtitle') : t('auth.createAccountSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {/* Role */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setRole('client')}
              className={`py-2.5 rounded-lg border-2 font-medium text-sm ${role === 'client' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
              {t('auth.iNeedJobs')}
            </button>
            <button type="button" onClick={() => setRole('worker')}
              className={`py-2.5 rounded-lg border-2 font-medium text-sm ${role === 'worker' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
              {t('auth.iWantToEarn')}
            </button>
          </div>

          {/* Resume Upload - Client Only */}
          {role === 'client' && (
            <div>
              <input type="file" ref={fileInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx,.txt" className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className={`w-full py-4 rounded-xl border-2 border-dashed transition-all text-center ${
                  resumeParsed
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                {parsing ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <span className="font-medium text-sm">{t('auth.parsingResume')}</span>
                  </div>
                ) : resumeParsed ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <FiCheck size={20} />
                    <div>
                      <span className="font-medium text-sm">{t('auth.resumeUploaded')}</span>
                      <span className="text-xs text-emerald-500 block">{resumeFileName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-500">
                    <FiUpload size={24} className="text-emerald-500" />
                    <span className="font-semibold text-sm text-gray-700">{t('auth.uploadResume')}</span>
                    <span className="text-xs text-gray-400">{t('auth.uploadResumeHint')}</span>
                  </div>
                )}
              </button>
              {!resumeParsed && (
                <p className="text-xs text-center text-gray-400 mt-2">{t('auth.orFillManually')}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" placeholder={t('auth.fullName')} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@email.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.whatsappNumber')}</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10" placeholder="9876543210" />
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('auth.whatsappHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10" placeholder="Min 6 characters" required />
            </div>
          </div>

          {role === 'client' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.experienceLevel')}</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} className="input-field">
                  <option value="fresher">{t('experience.fresher')}</option>
                  <option value="0-1">{t('experience.0-1')}</option>
                  <option value="1-3">{t('experience.1-3')}</option>
                  <option value="3-5">{t('experience.3-5')}</option>
                  <option value="5-10">{t('experience.5-10')}</option>
                  <option value="10+">{t('experience.10+')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.skills')}</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} className="input-field"
                  placeholder="e.g. React, Python, Data Entry, Excel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.preferredRoles')}</label>
                <input value={preferredRoles} onChange={e => setPreferredRoles(e.target.value)} className="input-field"
                  placeholder="e.g. Frontend Developer, Data Analyst" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.preferredLocations')}</label>
                <input value={preferredLocations} onChange={e => setPreferredLocations(e.target.value)} className="input-field"
                  placeholder="e.g. Bangalore, Remote, Mumbai" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${role === 'worker' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            {loading ? t('auth.creating') : role === 'worker' ? t('auth.createWorkerBtn') : t('auth.createClientBtn')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.haveAccount')} <Link to={`${prefix}/login`} className="text-emerald-600 font-medium hover:underline">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
