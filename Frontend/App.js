let token = localStorage.getItem('token');
let ws = null;

// Check if user is logged in
if (token) {
    showApp();
}

async function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        showApp();
        loadEvents();
        connectWebSocket();
    } else {
        alert(data.error);
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        showApp();
        loadEvents();
        connectWebSocket();
    } else {
        alert(data.error);
    }
}

function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    const user = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-role').textContent = user.role;
}

async function loadEvents() {
    const response = await fetch('/events', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const events = await response.json();
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = `
            <h4>${event.title} ${event.approved ? '✅' : '⏳'}</h4>
            <p>${event.description}</p>
            <p>📅 ${new Date(event.date).toLocaleString()}</p>
            <p>📍 ${event.location}</p>
            <button onclick="rsvp('${event.id}')">RSVP Going</button>
        `;
        eventsList.appendChild(eventDiv);
    });
}

async function createEvent() {
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value;
    
    const response = await fetch('/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date, location })
    });
    
    if (response.ok) {
        loadEvents();
        // Clear form
        ['event-title', 'event-desc', 'event-date', 'event-location'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }
}

function connectWebSocket() {
    ws = new WebSocket(`ws://localhost:${window.location.port || 3000}`);
    
    ws.onopen = () => {
        document.getElementById('ws-status').textContent = 'Connected';
        document.getElementById('ws-status').style.color = 'green';
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const messages = document.getElementById('ws-messages');
        
        const message = document.createElement('div');
        message.textContent = `📢 ${data.type}: ${data.event?.title || data.message}`;
        messages.appendChild(message);
        
        // Refresh events if new event created
        if (data.type === 'EVENT_CREATED') {
            loadEvents();
        }
    };
    
    ws.onclose = () => {
        document.getElementById('ws-status').textContent = 'Disconnected';
        document.getElementById('ws-status').style.color = 'red';
    };
}

function rsvp(eventId) {
    alert(`RSVP to event ${eventId} - Add this functionality!`);
}￼Enter
