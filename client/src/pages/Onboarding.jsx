import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function Onboarding() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [t('onboarding.step1'), t('onboarding.step2'), t('onboarding.step3')];

  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [education, setEducation] = useState(user?.profile?.education || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resumeUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.profile?.linkedinUrl || '');
  const [expectedSalary, setExpectedSalary] = useState(user?.profile?.expectedSalary || '');
  const [openToRemote, setOpenToRemote] = useState(true);
  const [preferredRoles, setPreferredRoles] = useState((user?.profile?.preferredRoles || []).join(', '));
  const [preferredLocations, setPreferredLocations] = useState((user?.profile?.preferredLocations || []).join(', '));
  const [skills, setSkills] = useState((user?.profile?.skills || []).join(', '));

  const [naukriEmail, setNaukriEmail] = useState('');
  const [naukriPass, setNaukriPass] = useState('');
  const [linkedinEmail, setLinkedinEmail] = useState('');
  const [linkedinPass, setLinkedinPass] = useState('');

  const prefix = `/${lang || 'en'}`;

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save profile
      await api.post('/user/onboarding', {
        headline, education, college, resumeUrl, linkedinUrl,
        expectedSalary, openToRemote,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        preferredRoles: preferredRoles.split(',').map(s => s.trim()).filter(Boolean),
        preferredLocations: preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
      });

      // Save credentials
      const creds = {};
      if (naukriEmail) creds.naukri_email = naukriEmail;
      if (naukriPass) creds.naukri_password = naukriPass;
      if (linkedinEmail) creds.linkedin_email = linkedinEmail;
      if (linkedinPass) creds.linkedin_password = linkedinPass;
      if (Object.keys(creds).length > 0) {
        await api.post('/user/vault', { credentials: creds });
      }

      await refreshUser();
      toast.success(t('onboarding.successToast'));
      navigate(`${prefix}/dashboard`);
    } catch (error) {
      toast.error(t('onboarding.errorToast'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{t('onboarding.title')}</h1>
        <p className="text-gray-500 text-center mb-8">{t('onboarding.subtitle')}</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? <FiCheck /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= step ? 'text-emerald-600' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">{t('onboarding.headline')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.headline')}</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} className="input-field"
                  placeholder={t('onboarding.headlinePlaceholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.education')}</label>
                  <select value={education} onChange={e => setEducation(e.target.value)} className="input-field">
                    <option value="">{t('experience.select')}</option>
                    <option value="10th">{t('experience.10th')}</option>
                    <option value="12th">{t('experience.12th')}</option>
                    <option value="diploma">{t('experience.diploma')}</option>
                    <option value="btech">{t('experience.btech')}</option>
                    <option value="bsc">{t('experience.bsc')}</option>
                    <option value="bca">{t('experience.bca')}</option>
                    <option value="bcom">{t('experience.bcom')}</option>
                    <option value="bba">{t('experience.bba')}</option>
                    <option value="mtech">{t('experience.mtech')}</option>
                    <option value="mba">{t('experience.mba')}</option>
                    <option value="mca">{t('experience.mca')}</option>
                    <option value="other">{t('experience.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.college')}</label>
                  <input value={college} onChange={e => setCollege(e.target.value)} className="input-field" placeholder={t('onboarding.college')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.skills')}</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} className="input-field"
                  placeholder={t('onboarding.skillsPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.resumeLink')}</label>
                <input value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} className="input-field"
                  placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.linkedin')}</label>
                <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="input-field"
                  placeholder="https://linkedin.com/in/yourname" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">{t('onboarding.step2')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.roles')}</label>
                <input value={preferredRoles} onChange={e => setPreferredRoles(e.target.value)} className="input-field"
                  placeholder={t('onboarding.rolesPlaceholder')} />
                <p className="text-xs text-gray-400 mt-1">{t('onboarding.rolesHint')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.locations')}</label>
                <input value={preferredLocations} onChange={e => setPreferredLocations(e.target.value)} className="input-field"
                  placeholder={t('onboarding.locationsPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.salary')}</label>
                <input value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} className="input-field"
                  placeholder={t('onboarding.salaryPlaceholder')} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={openToRemote} onChange={e => setOpenToRemote(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600" />
                <span className="text-sm text-gray-700">{t('onboarding.remote')}</span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-2">{t('onboarding.linkedinCreds')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('onboarding.encryptionNote')}</p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">{t('onboarding.naukri')}</h3>
                <input value={naukriEmail} onChange={e => setNaukriEmail(e.target.value)} className="input-field" placeholder={t('onboarding.naukriEmailPlaceholder')} />
                <input type="password" value={naukriPass} onChange={e => setNaukriPass(e.target.value)} className="input-field" placeholder={t('onboarding.naukriPasswordPlaceholder')} />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">{t('onboarding.linkedinCreds')}</h3>
                <input value={linkedinEmail} onChange={e => setLinkedinEmail(e.target.value)} className="input-field" placeholder={t('onboarding.linkedinEmailPlaceholder')} />
                <input type="password" value={linkedinPass} onChange={e => setLinkedinPass(e.target.value)} className="input-field" placeholder={t('onboarding.linkedinPasswordPlaceholder')} />
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
                {t('onboarding.encryptionDetail')}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary text-sm">{t('onboarding.back')}</button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2 text-sm">
                {t('onboarding.next')} <FiArrowRight />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
                {loading ? t('onboarding.saving') : t('onboarding.complete')} <FiCheck />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {t('onboarding.skipNote')}
        </p>
      </div>
    </div>
  );
}
