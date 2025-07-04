'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './TutorPage.module.css';

export default function TutorPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token, user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const initializeTutor = async () => {
      setLoading(true);
      try {
        const historyRes = await fetch('http://localhost:8000/api/quiz/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!historyRes.ok) throw new Error('Could not fetch quiz history.');
        const historyData = await historyRes.json();

        const topics = {};
        historyData.attempts.forEach(attempt => {
          if (!topics[attempt.topic]) topics[attempt.topic] = { totalScore: 0, count: 0 };
          topics[attempt.topic].totalScore += attempt.score;
          topics[attempt.topic].count++;
        });

        const calculatedWeakTopics = Object.entries(topics)
          .filter(([_, data]) => (data.totalScore / data.count) < 60)
          .map(([topic]) => topic);
        
        setWeakTopics(calculatedWeakTopics);

        const chatRes = await fetch('http://localhost:8000/api/tutor/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ messages: [], weakTopics: calculatedWeakTopics }),
        });

        if (!chatRes.ok) throw new Error('The AI tutor is unavailable right now.');
        const chatData = await chatRes.json();

        setMessages([{ role: 'assistant', content: chatData.reply }]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeTutor();
  }, [token, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newUserMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messages: updatedMessages, weakTopics }),
      });
      if (!res.ok) throw new Error('Failed to get a response from the tutor.');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Personalized AI Tutor: Mate</h2>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >
            <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && messages.length > 0 && (
          <div className={styles.messageWrapper}>
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSendMessage} className={styles.formWrapper}>
        <div className={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your weak topics..."
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
