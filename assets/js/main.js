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

  const normaliseBrand = (text) => text.replace(/undrenalyn\s*elab/gi, 'Undrenalyn eLab');

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
      const updated = normaliseBrand(original);
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
        const updated = normaliseBrand(value);
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

  const initTooltips = () => {
    const dictionary = (window.ELAB_TERMS || {});
    const terms = document.querySelectorAll('.term[data-key]');
    let tooltipCount = 0;

    terms.forEach((term) => {
      if (term.dataset.tooltipReady === 'true') {
        return;
      }
      const key = term.getAttribute('data-key');
      const definition = dictionary[key];
      if (!definition) return;

      const tooltip = document.createElement('div');
      tooltip.className = 'term-tooltip';
      const tooltipId = `term-tooltip-${tooltipCount += 1}`;
      tooltip.id = tooltipId;
      tooltip.textContent = definition;
      tooltip.dataset.visible = 'false';
      document.body.appendChild(tooltip);

      term.setAttribute('tabindex', '0');
      term.setAttribute('aria-describedby', tooltipId);

      const positionTooltip = () => {
        const rect = term.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 12;
        const left = rect.left + window.scrollX;
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
      };

      const showTooltip = () => {
        positionTooltip();
        tooltip.dataset.visible = 'true';
      };

      const hideTooltip = () => {
        tooltip.dataset.visible = 'false';
      };

      term.addEventListener('mouseenter', showTooltip);
      term.addEventListener('mouseleave', hideTooltip);
      term.addEventListener('focus', showTooltip);
      term.addEventListener('blur', hideTooltip);
      term.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          hideTooltip();
          term.blur();
        }
      });

      window.addEventListener('scroll', () => {
        if (tooltip.dataset.visible === 'true') {
          positionTooltip();
        }
      });

      window.addEventListener('resize', () => {
        if (tooltip.dataset.visible === 'true') {
          positionTooltip();
        }
      });

      term.dataset.tooltipReady = 'true';
    });
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
        response: "Nos missions démarrent à partir de 4 500 € pour un prototype complet (48 h) incluant tests et transfert." 
      },
      {
        keywords: ['agent builder', 'builder', 'openai', 'agent'],
        response: "Nous préparons la structure Agent Builder: définition du rôle, droits d’accès, jeux de test et calendrier de déclenchement."
      },
      {
        keywords: ['crm', 'salesforce', 'hubspot'],
        response: "Nous synchronisons votre CRM avec le <span class=\"term\" data-key=\"workflow\">workflow</span>: création de fiches, champs obligatoires, notifications ciblées."
      },
      {
        keywords: ['erp', 'stock', 'logistique', 'supply'],
        response: "Nous orchestrons la mise à jour ERP, les contrôles de stock et les alertes transport avec <span class=\"term\" data-key=\"journalisation\">journalisation</span> détaillée."
      },
      {
        keywords: ['support', 'service client', 'sav'],
        response: "Nous automatisons la qualification SAV, la création de tickets et l’escalade avec validations humaines à chaque étape clé."
      }
    ];

    const defaultResponses = [
      "Merci. Nous préparons une fiche processus et un prototype test sous 48 h.",
      "Compris. Je vous envoie notre gabarit de diagnostic pour préciser inputs/outputs.",
      "Je vous propose un créneau de 45 min pour cadrer les données et la validation humaine."
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
        appendMessage(findResponse(message), 'assistant');
        initTooltips();
      }, 500);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = String(new Date().getFullYear());
    }

    auditCopy();
    initTooltips();
    initSimulator();
    initChat();
  });
})();
