'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/quiz/history', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Could not load your progress.');

        const data = await response.json();
        setAttempts(data.attempts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  const dashboardData = useMemo(() => {
    if (attempts.length === 0) {
      return {
        totalQuizzes: 0,
        overallAverage: 0,
        performanceByTopic: [],
        recentAttempts: [],
      };
    }

    const topicStats = {};
    let totalScoreSum = 0;

    attempts.forEach((attempt) => {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { totalScore: 0, count: 0, topic: attempt.topic };
      }
      topicStats[attempt.topic].totalScore += attempt.score;
      topicStats[attempt.topic].count++;
      totalScoreSum += attempt.score;
    });

    const performanceByTopic = Object.values(topicStats).map(stat => ({
      ...stat,
      averageScore: Math.round(stat.totalScore / stat.count),
    }));

    return {
      totalQuizzes: attempts.length,
      overallAverage: Math.round(totalScoreSum / attempts.length),
      performanceByTopic,
      recentAttempts: attempts.slice(0, 5),
    };
  }, [attempts]);

  const getScoreClass = (score) => {
    if (score >= 80) return styles.green;
    if (score >= 50) return styles.yellow;
    return styles.red;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div>;
  if (error) return <p className={styles.red} style={{ textAlign: 'center', marginTop: '1rem' }}>{error}</p>;
  if (!user) return <div style={{ textAlign: 'center', padding: '2rem' }}>Please log in to see your dashboard.</div>;
  if (attempts.length === 0) {
    return (
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Welcome to Your Dashboard!</h2>
        <p style={{ color: '#94a3b8' }}>You haven't taken any quizzes yet. Complete one to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className={styles.card}>
          <h3 className={styles.heading}>Overall Average Score</h3>
          <p className={`${styles.value} ${getScoreClass(dashboardData.overallAverage)}`}>
            {dashboardData.overallAverage}%
          </p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.heading}>Total Quizzes Taken</h3>
          <p className={`${styles.value} ${styles.blue}`}>
            {dashboardData.totalQuizzes}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.card}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Performance by Topic</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer>
            <BarChart data={dashboardData.performanceByTopic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="topic" tick={{ fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="averageScore" name="Average Score (%)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className={styles.card}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {dashboardData.recentAttempts.map((attempt, idx) => (
            <div key={idx} className={styles.recentItem}>
              <div>
                <p className={styles.recentTopic}>{attempt.topic}</p>
                <p className={styles.recentTime}>
                  {new Date(attempt.completedAt).toLocaleString()}
                </p>
              </div>
              <div className={`${styles.value} ${getScoreClass(attempt.score)}`} style={{ fontSize: '1.5rem' }}>
                {attempt.score}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
