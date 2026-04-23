import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const INITIAL_DRAFT = {
  title: '',
  description: '',
  category: '',
  budget: '',
  budgetType: 'fixed',
  skills: '',
  deadline: '',
};

const JobPostingChatbot = ({ onClose }) => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! I can help you build a job posting using the required criteria: title, description, category, budget, skills, deadline, and optional images. Click start to begin.',
    },
  ]);
  const [input, setInput] = useState('');
  const [draftStarted, setDraftStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [projectImages, setProjectImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, ...message }]);
  };

  const categories = ['Construction', 'Carpentry', 'Plumbing', 'Electrical', 'Painting', 'Roofing', 'Other'];
  const budgetTypes = ['fixed', 'hourly'];
  const stepOrder = ['title', 'description', 'category', 'budgetType', 'budget', 'skills', 'deadline'];

  const fieldPrompts = {
    title: 'What is the job title?',
    description: 'Describe the job so freelancers know what you need.',
    category: 'Select the job category from the options below.',
    budgetType: 'Choose the budget type: fixed or hourly.',
    budget: 'What is the budget for this job?',
    skills: 'Which skills should the freelancer have? Separate them with commas.',
    deadline: 'When do you need the work completed by?'
  };

  const formatSkills = (value) => value.split(',').map((skill) => skill.trim()).filter(Boolean).join(', ');

  const getNextStep = (step) => {
    const index = stepOrder.indexOf(step);
    return index >= 0 && index < stepOrder.length - 1 ? stepOrder[index + 1] : null;
  };

  const addBotMessage = (text) => addMessage({ sender: 'bot', text });

  const startDraft = () => {
    setDraftStarted(true);
    setCurrentStep('title');
    addBotMessage('Awesome! Let’s begin your job posting. Please enter the job title.');
  };

  const handleIncomingText = (text) => {
    const normalized = text.trim();
    if (!normalized) return;

    addMessage({ sender: 'user', text: normalized });

    if (!draftStarted) {
      if (/(start|post|create|job|help)/i.test(normalized)) {
        startDraft();
      } else {
        addBotMessage('I can help you create a job posting using the required criteria. Type "start" whenever you are ready.');
      }
      return;
    }

    if (!currentStep) {
      addBotMessage('Your draft is complete. Press Submit when ready, or pick a field to update.');
      return;
    }

    handleFieldSubmit(normalized);
  };

  const handleFieldSubmit = (value) => {
    if (!currentStep) return;

    const nextDraft = { ...draft };
    let nextStep = getNextStep(currentStep);
    let botReply = '';

    if (currentStep === 'title') {
      nextDraft.title = value;
      botReply = fieldPrompts.description;
    } else if (currentStep === 'description') {
      nextDraft.description = value;
      nextStep = 'category';
      botReply = fieldPrompts.category;
    } else if (currentStep === 'category') {
      if (!categories.includes(value)) {
        addBotMessage(`Please select one of the allowed categories: ${categories.join(', ')}.`);
        return;
      }
      nextDraft.category = value;
      botReply = fieldPrompts.budgetType;
    } else if (currentStep === 'budgetType') {
      if (!budgetTypes.includes(value.toLowerCase())) {
        addBotMessage('Please choose either fixed or hourly.');
        return;
      }
      nextDraft.budgetType = value.toLowerCase();
      botReply = fieldPrompts.budget;
    } else if (currentStep === 'budget') {
      const budgetNumber = value.match(/\d+/);
      if (!budgetNumber) {
        addBotMessage('Please enter a budget amount using numbers only.');
        return;
      }
      nextDraft.budget = budgetNumber[0];
      botReply = fieldPrompts.skills;
    } else if (currentStep === 'skills') {
      nextDraft.skills = formatSkills(value);
      botReply = fieldPrompts.deadline;
    } else if (currentStep === 'deadline') {
      nextDraft.deadline = value;
      nextStep = null;
      botReply = 'All set! Your draft is ready to submit. You can upload job photos here and then press Submit.';
    }

    setDraft(nextDraft);
    setCurrentStep(nextStep);
    addBotMessage(botReply);
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    handleIncomingText(input);
    setInput('');
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));
    setProjectImages((prev) => [...prev, ...files].slice(0, 10));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 10));
    addMessage({ sender: 'bot', text: 'Nice! These images are attached to your job draft and will help freelancers understand the project.' });
  };

  const canSubmit = () => {
    return draft.title && draft.description && draft.category && draft.budget && draft.skills && draft.deadline;
  };

  const handleSubmitProject = async () => {
    if (!user) {
      setStatus({ type: 'error', message: 'Please log in to post a job.' });
      return;
    }

    if (user.userType !== 'client' && user.userType !== 'both') {
      setStatus({ type: 'error', message: 'Only client users can post jobs. Switch to a client account first.' });
      return;
    }

    if (!canSubmit()) {
      setStatus({ type: 'error', message: 'Please complete all required job details before submitting.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const projectData = new FormData();
      projectData.append('title', draft.title);
      projectData.append('description', draft.description);
      projectData.append('category', draft.category);
      projectData.append('budget', draft.budget);
      projectData.append('budgetType', draft.budgetType);
      projectData.append('skills', JSON.stringify(draft.skills.split(',').map((skill) => skill.trim())));
      projectData.append('deadline', draft.deadline);
      projectImages.forEach((image) => projectData.append('projectImages', image));

      await axios.post('/api/projects', projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus({ type: 'success', message: 'Project posted successfully! Check your dashboard for details.' });
      addMessage({ sender: 'bot', text: 'Your project has been posted successfully. Great job!' });
      setDraft(INITIAL_DRAFT);
      setDraftStarted(false);
      setProjectImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error posting project:', error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to post project.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '360px',
      maxHeight: '540px',
      backgroundColor: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Job Posting Assistant</h4>
          <p style={{ margin: '6px 0 0', fontSize: '12px', opacity: 0.9 }}>Fill in the required job posting criteria step-by-step.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
          aria-label="Close chatbot"
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, padding: '14px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'bot' ? 'flex-start' : 'flex-end',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '100%',
              backgroundColor: message.sender === 'bot' ? '#ffffff' : '#2563eb',
              color: message.sender === 'bot' ? '#111827' : 'white',
              padding: '10px 14px',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5
            }}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />

        {draftStarted && (
          <div style={{ marginTop: '12px', padding: '12px', borderRadius: '14px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Draft Summary</strong>
            <div style={{ fontSize: '13px', color: '#1f2937' }}>
              <p style={{ margin: '6px 0' }}><strong>Title:</strong> {draft.title || '—'}</p>
              <p style={{ margin: '6px 0' }}><strong>Description:</strong> {draft.description || '—'}</p>
              <p style={{ margin: '6px 0' }}><strong>Category:</strong> {draft.category || '—'}</p>
              <p style={{ margin: '6px 0' }}><strong>Budget:</strong> {draft.budget ? `$${draft.budget}` : '—'}</p>
              <p style={{ margin: '6px 0' }}><strong>Skills:</strong> {draft.skills || '—'}</p>
              <p style={{ margin: '6px 0' }}><strong>Deadline:</strong> {draft.deadline || '—'}</p>
            </div>
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Job Photos</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                  <img src={preview} alt={`Upload preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        <label htmlFor="jobbot-image-upload" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#475569' }}>
          Upload photos for the job (optional)
        </label>
        <input
          id="jobbot-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ width: '100%', marginBottom: '12px' }}
        />

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {currentStep === 'category' ? (
            <select
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '12px' }}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          ) : currentStep === 'budgetType' ? (
            <select
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '12px' }}
            >
              <option value="">Choose budget type</option>
              {budgetTypes.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          ) : currentStep === 'deadline' ? (
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '12px' }}
            />
          ) : currentStep === 'budget' ? (
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter budget amount"
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '12px' }}
            />
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={draftStarted ? 'Type your answer...' : 'Type a message to begin...'}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '12px' }}
            />
          )}
          <button type="submit" className="btn btn-primary" disabled={currentStep && !input.trim()} style={{ padding: '10px 14px' }}>
            {draftStarted ? 'Confirm' : 'Send'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => draftStarted ? (currentStep ? addBotMessage(fieldPrompts[currentStep]) : addBotMessage('Your draft is complete.')) : startDraft()}
            style={{ flex: 1, padding: '10px 12px' }}
          >
            {draftStarted ? 'Repeat Question' : 'Start Draft'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitProject}
            disabled={submitting || !draftStarted}
            style={{ flex: 1, padding: '10px 12px' }}
          >
            {submitting ? 'Posting...' : 'Submit Job'}
          </button>
        </div>

        {status && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: status.type === 'error' ? '#b91c1c' : '#0f766e' }}>
            {status.message}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
          Tip: answer the assistant questions to fill out the draft. Once ready, submit your job post.
        </div>
      </div>
    </div>
  );
};

export default JobPostingChatbot;
