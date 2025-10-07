(function () {
  'use strict';

  const bannedWords = [
    'élégant',
    'élégante',
    'élégants',
    'élégantes',
    'glossy',
    'incroyable',
    'révolutionnaire',
    'magique',
    'seamless',
    'disruptif',
    'premium',
    'ultime',
    'parfait',
    'game changer',
    'épique',
    'magnifique',
    'futuriste',
    'unique',
    'époustouflant',
    'sublime',
    'next-gen',
    'cutting-edge',
    'de a à z'
  ];

  const terminology = [
    { pattern: /workflow(s?)/gi, replacement: 'processus automatique$1' },
    { pattern: /agent(s?)/gi, replacement: 'assistant virtuel$1' },
    { pattern: /journalisation/gi, replacement: 'suivi détaillé' },
    { pattern: /validation humaine/gi, replacement: 'vous décidez' },
    { pattern: /webhook(s?)/gi, replacement: 'notification automatique$1' }
  ];

  const normaliseBrand = (text) => text.replace(/undrenalyn\s*elab/gi, 'Undrenalyn eLab');

  const applyTerminology = (text) => {
    let updated = text;
    terminology.forEach(({ pattern, replacement }) => {
      updated = updated.replace(pattern, replacement);
    });
    return updated;
  };

  const buildSelector = (element) => {
    if (!element || element === document.body) {
      return 'body';
    }
    const parts = [];
    let el = element;
    while (el && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) {
        selector += `#${el.id}`;
      } else if (el.className) {
        const className = String(el.className).trim().split(/\s+/).slice(0, 2).join('.');
        if (className) {
          selector += `.${className}`;
        }
      }
      parts.unshift(selector);
      el = el.parentElement;
    }
    return parts.join(' > ');
  };

  const auditCopy = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const issues = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node || !node.nodeValue) continue;
      const original = node.nodeValue;
      let updated = normaliseBrand(original);
      updated = applyTerminology(updated);
      if (updated !== original) {
        node.nodeValue = updated;
      }
      const lower = updated.toLowerCase();
      bannedWords.forEach((word) => {
        if (lower.includes(word)) {
          issues.push({ mot: word, selector: buildSelector(node.parentElement) });
        }
      });
    }

    document.querySelectorAll('*').forEach((element) => {
      for (const attr of Array.from(element.attributes || [])) {
        const value = attr.value;
        let updated = normaliseBrand(value);
        updated = applyTerminology(updated);
        if (updated !== value) {
          element.setAttribute(attr.name, updated);
        }
      }
    });

    if (issues.length) {
      console.table(issues);
    } else {
      console.table([]);
    }
  };

  const initSimulator = () => {
    const slider = document.getElementById('process-slider');
    if (!slider) return;
    const processCount = document.getElementById('process-count');
    const hoursSaved = document.getElementById('hours-saved');
    const annualValue = document.getElementById('annual-value');

    const updateSimulator = (value) => {
      const processes = Number(value);
      const hours = processes * 20;
      const annual = hours * 52 * 75;
      if (processCount) processCount.textContent = processes.toString();
      if (hoursSaved) hoursSaved.textContent = `${hours}\u00A0h`;
      if (annualValue) annualValue.innerHTML = annual.toLocaleString('fr-FR') + '\u00A0€';
    };

    updateSimulator(slider.value);
    slider.addEventListener('input', (event) => {
      updateSimulator(event.target.value);
    });
  };

  const initChat = () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatToggle || !chatWindow || !chatClose || !chatForm || !chatInput || !chatMessages) {
      return;
    }

    const knowledgeBase = [
      {
        keywords: ['prix', 'tarif', 'budget', 'coût'],
        response: 'Nos missions démarrent à 4 500 € pour un prototype complet incluant tests, formation et transfert.'
      },
      {
        keywords: ['assistant', 'assistant virtuel', 'openai'],
        response: 'Nous configurons l’assistant virtuel: rôle, accès sécurisés, scénarios tests et suivi détaillé.'
      },
      {
        keywords: ['crm', 'salesforce', 'hubspot'],
        response: 'Nous synchronisons votre CRM avec le processus automatique: fiches créées, champs vérifiés, notification automatique envoyée.'
      },
      {
        keywords: ['erp', 'stock', 'logistique', 'supply'],
        response: 'Nous orchestrons la mise à jour ERP, les contrôles de stock et les alertes transport avec suivi détaillé.'
      },
      {
        keywords: ['support', 'service client', 'sav'],
        response: 'Nous automatisons la qualification SAV, la création de tickets et l’escalade. Vous décidez des validations clés.'
      }
    ];

    const defaultResponses = [
      'Merci. Nous préparons une fiche processus et un prototype test sous 48 h.',
      'Compris. Je vous envoie notre gabarit de diagnostic pour préciser inputs/outputs.',
      'Je vous propose un créneau de 45 min pour cadrer les données et confirmer que vous décidez des derniers contrôles.'
    ];

    const findResponse = (message) => {
      const lower = message.toLowerCase();
      for (const entry of knowledgeBase) {
        if (entry.keywords.some((keyword) => lower.includes(keyword))) {
          return entry.response;
        }
      }
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    const appendMessage = (content, role = 'user') => {
      const bubble = document.createElement('div');
      bubble.className = role === 'user'
        ? 'self-end rounded-2xl bg-gradient-to-r from-aurora/80 to-opal/80 px-4 py-3 text-midnight'
        : 'self-start rounded-2xl bg-white/10 px-4 py-3 text-slate-100';
      bubble.innerHTML = content;
      chatMessages.appendChild(bubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const openChat = () => {
      chatWindow.classList.remove('hidden');
      chatToggle.classList.add('hidden');
      chatInput.focus();
    };

    const closeChat = () => {
      chatWindow.classList.add('hidden');
      chatToggle.classList.remove('hidden');
    };

    chatToggle.addEventListener('click', openChat);
    chatClose.addEventListener('click', closeChat);

    chatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;
      appendMessage(message, 'user');
      chatInput.value = '';
      setTimeout(() => {
        appendMessage(applyTerminology(findResponse(message)), 'assistant');
      }, 500);
    });
  };

  const initRevealAnimations = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealElements.forEach((el) => observer.observe(el));
  };

  const animateValue = (element, target, { duration = 1400, suffix = '', decimals = 0 } = {}) => {
    const start = 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      const value = start + (target - start) * eased;
      element.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const initCounters = () => {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const revealCounter = (element) => {
      const target = Number(element.dataset.counter || '0');
      const suffix = element.dataset.suffix || '';
      const decimals = Number(element.dataset.decimals || '0');
      const duration = Number(element.dataset.duration || '1400');
      animateValue(element, target, { duration, suffix, decimals });
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(revealCounter);
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    counters.forEach((counter) => observer.observe(counter));
  };

  const initGauges = () => {
    const fills = document.querySelectorAll('[data-gauge]');
    if (!fills.length) return;

    const setGauge = (element) => {
      const value = Math.min(100, Math.max(0, Number(element.dataset.gauge || '0')));
      element.style.width = `${value}%`;
    };

    if (!('IntersectionObserver' in window)) {
      fills.forEach(setGauge);
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setGauge(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    fills.forEach((fill) => observer.observe(fill));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = String(new Date().getFullYear());
    }

    auditCopy();
    initSimulator();
    initChat();
    initRevealAnimations();
    initCounters();
    initGauges();
  });
})();
