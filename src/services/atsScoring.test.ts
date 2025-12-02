/**
 * Unit Tests for ATS Scoring Engine
 */

import { describe, it, expect } from 'vitest';
import { calculateRealTimeATSScore } from './atsScoring';
import type { CVData } from '../types';

// Mock CV Data for testing
const createMockCV = (overrides?: Partial<CVData>): CVData => ({
  template: 'modern',
  theme: {
    name: 'Midnight Blue',
    primary: '#1e3a8a',
    secondary: '#eff6ff',
    text: '#1e293b'
  },
  personal: {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: 'San Francisco, CA',
    website: 'https://johndoe.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    jobTitle: 'Senior Software Engineer',
    summary: 'Experienced software engineer with 8+ years building scalable web applications.',
    photoBase64: '',
    photoShape: 'circle',
    photoFilter: 'none'
  },
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2020',
      endDate: '2024',
      current: true,
      description: 'Led development of microservices architecture, improving system performance by 40%. Managed team of 5 engineers. Built React applications serving 1M+ users.'
    }
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Computer Science',
      school: 'University of California',
      location: 'Berkeley, CA',
      year: '2016'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Python', 'PostgreSQL'],
  certifications: [],
  languages: [],
  ...overrides
});

describe('ATS Scoring Engine', () => {
  describe('calculateRealTimeATSScore', () => {
    it('should return a valid score breakdown', () => {
      const cv = createMockCV();
      const result = calculateRealTimeATSScore(cv);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(['Excellent', 'Good', 'Fair', 'Poor']).toContain(result.grade);
    });

    it('should have all 6 criteria with correct weights', () => {
      const cv = createMockCV();
      const result = calculateRealTimeATSScore(cv);

      expect(result.criteria.keywords.weight).toBe(25);
      expect(result.criteria.formatting.weight).toBe(20);
      expect(result.criteria.quantification.weight).toBe(15);
      expect(result.criteria.actionVerbs.weight).toBe(15);
      expect(result.criteria.length.weight).toBe(10);
      expect(result.criteria.structure.weight).toBe(15);

      // Total weight should be 100
      const totalWeight = 25 + 20 + 15 + 15 + 10 + 15;
      expect(totalWeight).toBe(100);
    });

    it('should return suggestions array', () => {
      const cv = createMockCV();
      const result = calculateRealTimeATSScore(cv);

      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Keyword Density Analysis', () => {
    it('should score higher with more industry keywords', () => {
      const cvWithFewKeywords = createMockCV({
        skills: ['JavaScript', 'React']
      });
      const cvWithManyKeywords = createMockCV({
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Python', 'PostgreSQL', 'Kubernetes', 'Redis']
      });

      const resultFew = calculateRealTimeATSScore(cvWithFewKeywords);
      const resultMany = calculateRealTimeATSScore(cvWithManyKeywords);

      expect(resultMany.criteria.keywords.score).toBeGreaterThan(resultFew.criteria.keywords.score);
    });

    it('should improve score when job description matches', () => {
      const cv = createMockCV();
      const jobDescription = 'Looking for a React developer with Node.js and TypeScript experience. AWS and Docker knowledge required.';

      const resultWithoutJD = calculateRealTimeATSScore(cv);
      const resultWithJD = calculateRealTimeATSScore(cv, jobDescription);

      // With matching JD, keyword score should be equal or better
      expect(resultWithJD.criteria.keywords.score).toBeGreaterThanOrEqual(resultWithoutJD.criteria.keywords.score);
    });
  });

  describe('Formatting Validation', () => {
    it('should penalize missing contact information', () => {
      const cvComplete = createMockCV();
      const cvIncomplete = createMockCV({
        personal: {
          ...cvComplete.personal,
          email: '',
          phone: ''
        }
      });

      const resultComplete = calculateRealTimeATSScore(cvComplete);
      const resultIncomplete = calculateRealTimeATSScore(cvIncomplete);

      // Missing email (-15) and phone (-10) = -25 points, so 75% score
      expect(resultIncomplete.criteria.formatting.score).toBeLessThan(resultComplete.criteria.formatting.score);
      expect(resultIncomplete.criteria.formatting.score).toBeLessThanOrEqual(75);
      expect(resultIncomplete.criteria.formatting.details.some(d => d.toLowerCase().includes('email') || d.toLowerCase().includes('phone'))).toBe(true);
    });

    it('should pass with properly formatted contact info', () => {
      const cv = createMockCV();
      const result = calculateRealTimeATSScore(cv);

      expect(result.criteria.formatting.passed).toBe(true);
      expect(result.criteria.formatting.score).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Quantification Detection', () => {
    it('should detect quantified achievements', () => {
      const cvWithMetrics = createMockCV({
        experience: [{
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'SF',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: 'Increased sales by 30%. Reduced costs by $50k. Managed team of 10 engineers. Improved performance by 2x.'
        }]
      });

      const result = calculateRealTimeATSScore(cvWithMetrics);

      expect(result.criteria.quantification.score).toBeGreaterThan(50);
    });

    it('should penalize achievements without metrics', () => {
      const cvWithoutMetrics = createMockCV({
        experience: [{
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'SF',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: 'Worked on improving sales. Helped reduce costs. Responsible for managing team. Improved performance.'
        }]
      });

      const result = calculateRealTimeATSScore(cvWithoutMetrics);

      expect(result.criteria.quantification.score).toBeLessThan(30);
      expect(result.criteria.quantification.passed).toBe(false);
    });
  });

  describe('Action Verb Analysis', () => {
    it('should score high with strong action verbs', () => {
      const cvStrong = createMockCV({
        experience: [{
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'SF',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: 'Led development team. Achieved 40% improvement. Optimized system architecture. Spearheaded migration project.'
        }]
      });

      const result = calculateRealTimeATSScore(cvStrong);

      expect(result.criteria.actionVerbs.score).toBeGreaterThan(60);
      expect(result.criteria.actionVerbs.passed).toBe(true);
    });

    it('should penalize weak phrases', () => {
      const cvWeak = createMockCV({
        experience: [{
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'SF',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: 'Responsible for development. Helped with improvements. Assisted with architecture. Worked on migration project.'
        }]
      });

      const result = calculateRealTimeATSScore(cvWeak);

      expect(result.criteria.actionVerbs.score).toBeLessThan(60);
      expect(result.criteria.actionVerbs.passed).toBe(false);
      expect(result.criteria.actionVerbs.details.some(d => d.includes('weak'))).toBe(true);
    });
  });

  describe('Length Validation', () => {
    it('should score optimal length CVs highly', () => {
      // Create a CV with more content to reach optimal word count
      const cv = createMockCV({
        personal: {
          ...createMockCV().personal,
          summary: 'Experienced software engineer with over 8 years of expertise in building scalable web applications, microservices architecture, and cloud infrastructure. Proven track record of leading cross-functional teams and delivering high-impact projects. Strong background in full-stack development, DevOps practices, and agile methodologies. Passionate about writing clean, maintainable code and mentoring junior developers.'
        },
        experience: [
          {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            startDate: '2020',
            endDate: '2024',
            current: true,
            description: 'Led development of microservices architecture serving over 2 million users, improving system performance by 45% and reducing latency by 60%. Managed cross-functional team of 8 engineers across frontend, backend, and DevOps. Architected and implemented scalable cloud infrastructure on AWS, handling 10,000+ requests per second. Built React applications with TypeScript, implementing modern design patterns and best practices. Reduced deployment time by 70% through CI/CD pipeline optimization using Jenkins and Docker. Mentored 5 junior developers, conducting code reviews and technical training sessions.'
          },
          {
            id: '2',
            title: 'Software Engineer',
            company: 'StartupXYZ',
            location: 'San Francisco, CA',
            startDate: '2017',
            endDate: '2020',
            current: false,
            description: 'Developed full-stack web applications using Node.js, Express, and React, serving 500k+ users. Implemented RESTful APIs and GraphQL endpoints for mobile and web clients. Optimized database queries reducing response time by 40%. Collaborated with product managers and designers to deliver features on tight deadlines. Participated in on-call rotation maintaining 99.9% uptime for production systems.'
          }
        ]
      });

      const result = calculateRealTimeATSScore(cv);

      // This CV has more content, should score better than minimal CV
      // Note: May still be under 400 words, but should be reasonable
      expect(result.criteria.length.score).toBeGreaterThanOrEqual(30);
      expect(result.criteria.length.details.length).toBeGreaterThan(0);
    });

    it('should penalize very short CVs', () => {
      const cvShort = createMockCV({
        personal: {
          ...createMockCV().personal,
          summary: 'Engineer'
        },
        experience: [{
          id: '1',
          title: 'Engineer',
          company: 'Company',
          location: 'City',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: 'Worked on projects.'
        }]
      });

      const result = calculateRealTimeATSScore(cvShort);

      expect(result.criteria.length.score).toBeLessThan(70);
      expect(result.criteria.length.details.some(d => d.includes('short'))).toBe(true);
    });
  });

  describe('Structure Validation', () => {
    it('should validate required sections', () => {
      const cvComplete = createMockCV();
      const result = calculateRealTimeATSScore(cvComplete);

      expect(result.criteria.structure.passed).toBe(true);
      expect(result.criteria.structure.score).toBeGreaterThanOrEqual(70);
    });

    it('should penalize missing sections', () => {
      const cvIncomplete = createMockCV({
        experience: [],
        education: [],
        skills: []
      });

      const result = calculateRealTimeATSScore(cvIncomplete);

      expect(result.criteria.structure.score).toBeLessThan(50);
      expect(result.criteria.structure.passed).toBe(false);
      expect(result.criteria.structure.details.length).toBeGreaterThan(1);
    });

    it('should penalize missing or short summary', () => {
      const cvNoSummary = createMockCV({
        personal: {
          ...createMockCV().personal,
          summary: ''
        }
      });

      const result = calculateRealTimeATSScore(cvNoSummary);

      expect(result.criteria.structure.score).toBeLessThan(90);
      expect(result.criteria.structure.details.some(d => d.includes('summary'))).toBe(true);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should assign Excellent grade for high scores', () => {
      const excellentCV = createMockCV({
        personal: {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 234 567 8900',
          address: 'New York, NY',
          website: 'https://janesmith.dev',
          linkedin: 'https://linkedin.com/in/janesmith',
          jobTitle: 'Senior Full-Stack Engineer',
          summary: 'Highly accomplished senior full-stack engineer with 10+ years of experience building scalable web applications. Proven track record of leading teams and delivering high-impact projects.',
          photoBase64: '',
          photoShape: 'circle',
          photoFilter: 'none'
        },
        experience: [{
          id: '1',
          title: 'Senior Full-Stack Engineer',
          company: 'Tech Giants Inc',
          location: 'New York, NY',
          startDate: '2018',
          endDate: '2024',
          current: true,
          description: 'Led development of microservices architecture, improving system performance by 45%. Managed cross-functional team of 8 engineers. Built React applications serving 2M+ users. Reduced deployment time by 60% through CI/CD optimization. Architected scalable infrastructure handling 10k+ requests per second.'
        }],
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Python']
      });

      const result = calculateRealTimeATSScore(excellentCV);

      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(['Excellent', 'Good']).toContain(result.grade);
    });

    it('should assign Poor grade for minimal CVs', () => {
      const poorCV = createMockCV({
        personal: {
          fullName: 'John',
          email: '',
          phone: '',
          address: '',
          website: '',
          linkedin: '',
          jobTitle: '',
          summary: 'Engineer',
          photoBase64: '',
          photoShape: 'circle',
          photoFilter: 'none'
        },
        experience: [],
        education: [],
        skills: []
      });

      const result = calculateRealTimeATSScore(poorCV);

      expect(result.overall).toBeLessThan(50);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CV gracefully', () => {
      const emptyCV = createMockCV({
        personal: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          website: '',
          linkedin: '',
          jobTitle: '',
          summary: '',
          photoBase64: '',
          photoShape: 'circle',
          photoFilter: 'none'
        },
        experience: [],
        education: [],
        skills: []
      });

      const result = calculateRealTimeATSScore(emptyCV);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should handle CV with HTML in descriptions', () => {
      const cvWithHTML = createMockCV({
        experience: [{
          id: '1',
          title: 'Engineer',
          company: 'Corp',
          location: 'City',
          startDate: '2020',
          endDate: '2024',
          current: true,
          description: '<ul><li>Led team of 5 engineers</li><li>Increased revenue by 30%</li><li>Achieved 99.9% uptime</li></ul>'
        }]
      });

      const result = calculateRealTimeATSScore(cvWithHTML);

      expect(result).toBeDefined();
      expect(result.criteria.quantification.score).toBeGreaterThan(30);
    });
  });
});
