(function(){
  const DATA_URL = '../data/contacts.json';
  const DELETED_KEY = 'revibe_contacts_deleted';
  const MESSAGES_KEY = 'revibe_contact_messages';
  const STATUS_KEY = 'revibe_contact_status';

  function readDeleted(){ try { return JSON.parse(localStorage.getItem(DELETED_KEY)||'[]'); } catch(e){ return []; } }
  function writeDeleted(arr){ try { localStorage.setItem(DELETED_KEY, JSON.stringify(arr)); } catch(e){} }
  function readMessages(){ try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)||'{}'); } catch(e){ return {}; } }
  function writeMessages(obj){ try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(obj)); } catch(e){} }
  function readStatuses(){ try { return JSON.parse(localStorage.getItem(STATUS_KEY)||'{}'); } catch(e){ return {}; } }
  function writeStatuses(obj){ try { localStorage.setItem(STATUS_KEY, JSON.stringify(obj)); } catch(e){} }

  function formatDate(iso){
    if (!iso) return '';
    const d = new Date(iso);
    return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  let all = [];
  let currentChatId = null;
  let currentContact = null;

  // Initial messages for customers - Replied contacts have admin responses
  const initialMessages = {
    'CT01': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'I need advice on this product'},
      {sender:'customer',text:'Can you help me?'}
    ],
    'CT02': [
      {sender:'customer',text:'Hello'},
      {sender:'customer',text:'I have a question about my order'},
      {sender:'customer',text:'Order number is #12345'},
      {sender:'admin',text:'Sure! Which product are you looking at?'},
      {sender:'admin',text:'I\'ll do my best to assist you!'}
    ],
    'CT03': [
      {sender:'customer',text:'Hi there'},
      {sender:'customer',text:'When will my order arrive?'},
      {sender:'customer',text:'I ordered 3 days ago'},
      {sender:'customer',text:'Can you check the status please?'}
    ],
    'CT04': [
      {sender:'customer',text:'Good morning'},
      {sender:'customer',text:'I want to return a product'},
      {sender:'customer',text:'It doesn\'t fit me'},
      {sender:'customer',text:'What should I do?'}
    ],
    'CT05': [
      {sender:'customer',text:'Hello'},
      {sender:'customer',text:'Thank you for your help'},
      {sender:'customer',text:'The product arrived perfectly'},
      {sender:'admin',text:'You\'re very welcome!'},
      {sender:'admin',text:'We\'re glad to hear that. Enjoy your purchase!'}
    ],
    'CT06': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'I love your products'},
      {sender:'customer',text:'Do you have more colors?'},
      {sender:'admin',text:'Thank you for your kind words!'},
      {sender:'admin',text:'Yes, we have several color options available. Would you like me to show you?'}
    ],
    'CT07': [
      {sender:'customer',text:'Hello'},
      {sender:'customer',text:'Do you have discounts?'},
      {sender:'customer',text:'I\'m looking for a good deal'},
      {sender:'customer',text:'Any promotions right now?'}
    ],
    'CT08': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'Can I change my order?'},
      {sender:'customer',text:'I want different size'},
      {sender:'customer',text:'Is it still possible?'}
    ],
    'CT09': [
      {sender:'customer',text:'Good day'},
      {sender:'customer',text:'I need help with shipping'},
      {sender:'customer',text:'How long does it take?'},
      {sender:'admin',text:'Hello! Our standard shipping takes 3-5 business days.'},
      {sender:'admin',text:'For express delivery, it\'s 1-2 business days. Which option would you prefer?'}
    ],
    'CT10': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'What payment methods do you accept?'},
      {sender:'customer',text:'Can I pay with credit card?'}
    ],
    'CT11': [
      {sender:'customer',text:'Hello there'},
      {sender:'customer',text:'I received a damaged item'},
      {sender:'customer',text:'The package was opened'},
      {sender:'admin',text:'I\'m sorry to hear about that!'},
      {sender:'admin',text:'Please send us photos of the damage and we\'ll arrange a replacement immediately.'}
    ],
    'CT12': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'Do you ship internationally?'},
      {sender:'customer',text:'I\'m in Canada'},
      {sender:'customer',text:'What are the shipping costs?'}
    ],
    'CT13': [
      {sender:'customer',text:'Good afternoon'},
      {sender:'customer',text:'I want to cancel my order'},
      {sender:'customer',text:'I changed my mind'},
      {sender:'customer',text:'Please help me cancel'}
    ],
    'CT14': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'Your products are amazing!'},
      {sender:'customer',text:'I\'ll definitely order again'},
      {sender:'admin',text:'Thank you so much for your feedback!'},
      {sender:'admin',text:'We truly appreciate your support. Feel free to reach out anytime!'}
    ],
    'CT15': [
      {sender:'customer',text:'Hello'},
      {sender:'customer',text:'I have a question about sizing'},
      {sender:'customer',text:'What size should I get?'},
      {sender:'customer',text:'I\'m usually a medium'}
    ],
    'CT16': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'When will you restock?'},
      {sender:'customer',text:'Item is out of stock'},
      {sender:'admin',text:'We\'re expecting new stock next week!'},
      {sender:'admin',text:'Would you like me to notify you when it\'s available?'}
    ],
    'CT17': [
      {sender:'customer',text:'Good morning'},
      {sender:'customer',text:'I need to track my order'},
      {sender:'customer',text:'Can you provide tracking number?'},
      {sender:'customer',text:'Order #67890'}
    ],
    'CT18': [
      {sender:'customer',text:'Hi'},
      {sender:'customer',text:'I love the quality'},
      {sender:'customer',text:'Do you have a loyalty program?'},
      {sender:'admin',text:'Thank you for your feedback!'},
      {sender:'admin',text:'Yes, we have a rewards program. You can earn points with every purchase!'}
    ],
    'CT19': [
      {sender:'customer',text:'Hello'},
      {sender:'customer',text:'Can I exchange for different color?'},
      {sender:'customer',text:'I want blue instead of red'},
      {sender:'customer',text:'Is exchange possible?'}
    ],
    'CT20': [
      {sender:'customer',text:'Hi there'},
      {sender:'customer',text:'Thank you for fast delivery'},
      {sender:'customer',text:'Everything arrived perfect'},
      {sender:'admin',text:'We\'re so happy to hear that!'},
      {sender:'admin',text:'Thank you for choosing us. Enjoy your products!'}
    ]
  };

  function render(contacts){
    const body = document.getElementById('contactBody');
    if (!body) return;
    const statuses = readStatuses();
    body.innerHTML = contacts.map(c => {
      const status = statuses[c.id] || c.status;
      const statusClass = (status||'').toLowerCase();
      return `
        <tr>
          <td>${c.id}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${formatDate(c.date)}</td>
          <td><span class="status ${statusClass}">${status}</span></td>
          <td>
            <button class="btn-reply" data-id="${c.id}">Reply</button>
            <button class="btn-delete" data-id="${c.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire reply buttons
    body.querySelectorAll('.btn-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openChat(id);
      });
    });

    // Wire delete buttons
    body.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const ok = confirm('Do you want to delete this message?');
        if (!ok) return;
        const deleted = new Set(readDeleted());
        deleted.add(id);
        writeDeleted(Array.from(deleted));
        all = all.filter(c => c.id !== id);
        applyFilters();
      });
    });
  }

  function openChat(contactId){
    const contact = all.find(c => c.id === contactId);
    if (!contact) return;
    currentChatId = contactId;
    const box = document.getElementById('chatBox');
    const nameEl = document.getElementById('chatCustomerName');
    if (nameEl) nameEl.textContent = contact.name;
    if (box) box.style.display = 'flex';
    loadChatMessages(contactId);
  }

  function closeChat(){
    const box = document.getElementById('chatBox');
    if (box) box.style.display = 'none';
    const statuses = readStatuses();
    const messages = readMessages();
    if (currentChatId && messages[currentChatId] && messages[currentChatId].some(m => m.sender === 'admin')){
      statuses[currentChatId] = 'Replied';
      writeStatuses(statuses);
      all.forEach(c => {
        if (c.id === currentChatId) c.status = 'Replied';
      });
      applyFilters();
    }
    currentChatId = null;
  }

  function loadChatMessages(contactId){
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const stored = readMessages();
    const msgs = stored[contactId] || initialMessages[contactId] || [];
    container.innerHTML = msgs.map(m => {
      const isAdmin = m.sender === 'admin';
      const avatarSrc = isAdmin ? '../assets/images/admin.jpg' : '../assets/images/customer.jpg';
      return `
        <div class="msg ${m.sender}">
          <img src="${avatarSrc}" alt="" class="msg-avatar" />
          <div class="msg-bubble">${m.text}</div>
        </div>
      `;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function sendMessage(text){
    if (!currentChatId || !text.trim()) return;
    const messages = readMessages();
    if (!messages[currentChatId]) messages[currentChatId] = initialMessages[currentChatId] || [];
    messages[currentChatId].push({sender:'admin',text:text.trim()});
    writeMessages(messages);
    loadChatMessages(currentChatId);
  }

  function applyFilters(){
    const statusFilter = document.getElementById('statusFilter');
    const sortOrder = document.getElementById('sortOrder');
    const statusVal = (statusFilter && statusFilter.value) || 'all';
    const sortVal = (sortOrder && sortOrder.value) || 'latest';
    const statuses = readStatuses();
    let filtered = all.map(c => ({...c, status: statuses[c.id] || c.status}));
    filtered = statusVal === 'all' ? filtered : filtered.filter(c => (c.status||'').toLowerCase() === statusVal.toLowerCase());
    filtered = [...filtered].sort((a,b) => {
      const da = new Date(a.date||0).getTime();
      const db = new Date(b.date||0).getTime();
      return sortVal === 'latest' ? db - da : da - db;
    });
    render(filtered);
  }

  document.addEventListener('DOMContentLoaded', async function(){
    try {
      const res = await fetch(DATA_URL);
      const json = await res.json();
      const deleted = new Set(readDeleted());
      all = (json.contacts || []).filter(c => !deleted.has(c.id));
      const statusFilter = document.getElementById('statusFilter');
      const sortOrder = document.getElementById('sortOrder');
      if (statusFilter) statusFilter.addEventListener('change', applyFilters);
      if (sortOrder) sortOrder.addEventListener('change', applyFilters);
      applyFilters();

      const chatClose = document.getElementById('chatClose');
      const chatInput = document.getElementById('chatInput');
      if (chatClose) chatClose.addEventListener('click', closeChat);
      if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && chatInput.value.trim()) {
            sendMessage(chatInput.value);
            chatInput.value = '';
          }
        });
      }
    } catch(e){
      console.error('Failed to load contacts', e);
    }
  });
})();
