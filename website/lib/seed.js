const store = require('./store');

function defaultBadges() {
  return [
    { id: 'b_owner',     name: 'Owner',         desc: 'Website & Project Owner', icon: '👑', color: '#ffaa00', role: 'staff' },
    { id: 'b_basic',     name: 'Basic User',    desc: 'Standard Community Member', icon: '👤', color: '#9ea4bd', role: 'user' },
    { id: 'b_verified',  name: 'Verified',  desc: 'Official GTAMP team / confirmed identity', icon: '✔', color: '#3ddc84', role: 'staff' },
    { id: 'b_staff',     name: 'Staff',     desc: 'Member of the GTAMP team', icon: '🛠', color: '#8b6cff', role: 'staff' },
    { id: 'b_admin',     name: 'Administrator', desc: 'GTAMP administrator', icon: '⚙', color: '#e05050', role: 'staff' },
    { id: 'b_dev',       name: 'Developer', desc: 'Contributed code to GTAMP', icon: '⌨', color: '#6ac6ff', role: 'achievement' },
    { id: 'b_founder',   name: 'Founder',   desc: 'Founded / owns GTAMP', icon: '★', color: '#ffb83d', role: 'staff' },
    { id: 'b_host_1',    name: 'Server Host', desc: 'Hosted a public server for 7 days', icon: '🖥', color: '#30a060', role: 'achievement' },
    { id: 'b_host_2',    name: 'Dedicated Host', desc: 'Hosted a public server for 30 days', icon: '🖥', color: '#30c080', role: 'achievement' },
    { id: 'b_author_1',  name: 'Author',    desc: 'Published 1 marketplace asset', icon: '📦', color: '#a050e0', role: 'achievement' },
    { id: 'b_author_5',  name: 'Prolific Author', desc: 'Published 5 marketplace assets', icon: '📦', color: '#c070ff', role: 'achievement' },
    { id: 'b_patron',    name: 'Patron',    desc: 'Boosted a server via upvotes', icon: '💜', color: '#e05aa0', role: 'patron' },
    { id: 'b_early',     name: 'Early Adopter', desc: 'Joined GTAMP during early access', icon: '🚀', color: '#6ac6ff', role: 'achievement' },
    { id: 'b_contributor', name: 'Community Contributor', desc: 'Helped others on the forum', icon: '💬', color: '#8ab0ff', role: 'achievement' }
  ];
}

function defaultForumCategories() {
  return [
    { id: 'announcements', name: 'Announcements', desc: 'GTAMP news and updates', role: 'announce' },
    { id: 'general',       name: 'General Discussion', desc: 'Talk about GTAMP and multiplayer' },
    { id: 'gtamp-discussion', name: 'GTAMP Discussion', desc: 'Discussion about GTAMP itself' },
    { id: 'client-support',  name: 'GTAMP Client Support', desc: 'Help with the launcher and client' },
    { id: 'server-support',  name: 'Server Support', desc: 'Help running your own server' },
    { id: 'scripting',       name: 'Scripting', desc: 'Lua/JS scripting help' },
    { id: 'showcases',       name: 'Showcases', desc: 'Show off your servers and assets' },
    { id: 'marketplace-talk', name: 'Marketplace', desc: 'Buy, sell, and discuss assets' }
  ];
}

function defaultSettings() {
  return {
    siteName: 'GTAMP',
    tagline: 'FiveM-style GTA V multiplayer',
    version: '1.6.0',
    downloadUrl: '/download/GTAMP-Launcher-v2.1.1.exe',
    activeLauncherCount: 0,
    liveServers: [],
    upvoteBasePriceUsd: 0.50
  };
}

function defaultDocs() {
  return [
    { id: 'getstarted', cat: 'Getting Started', title: 'Getting Started', body: 'Install, launch, and connect to your first server.' },
    { id: 'install', cat: 'Getting Started', title: 'How to Install GTAMP', body: 'Download the launcher, install ScriptHookV, and run.' },
    { id: 'runserver', cat: 'Running a Server', title: 'Run Your Own Server', body: 'Create a server and install the FXServer artifacts.' },
    { id: 'artifacts', cat: 'Running a Server', title: 'Installing Artifacts', body: 'Download and set up the server artifacts.' },
    { id: 'resources', cat: 'Running a Server', title: 'Adding Resources', body: 'Add resources to your server.' },
    { id: 'scripting', cat: 'Scripting', title: 'Scripting Basics', body: 'Write your first Lua/JS script.' },
    { id: 'keymaster', cat: 'Keymaster', title: 'Using the Keymaster', body: 'Manage your server license keys.' },
    { id: 'faq', cat: 'Support', title: 'FAQ', body: 'Common questions answered.' }
  ];
}

function defaultArtifacts() {
  return [
    { version: '1.6.0', platform: 'Windows', url: '/artifacts/gtamp-server-windows.zip', note: 'Recommended' },
    { version: '1.6.0', platform: 'Linux', url: '/artifacts/gtamp-server-linux.tar.gz', note: '' }
  ];
}

function defaultPosts() {
  return [
    { id: 1, cat: 'announcements', title: 'GTAMP v2.1.1 is live', body: 'FiveM-style launcher, remote players with nametags, F8 chat, and the new website.', uid: 1, at: Date.now() - 86400000 * 3 },
    { id: 2, cat: 'client-support', title: 'Fixed: hook loads as v1.5.2', body: 'Reinstall the current launcher — older copies ship the old hook.', uid: 2, at: Date.now() - 86400000 * 2 },
    { id: 3, cat: 'scripting', title: 'Your first GTAMP script', body: 'A few lines of JS or Lua is all it takes — check the docs.', uid: 3, at: Date.now() - 86400000 }
  ];
}
function defaultReplies() {
  return [
    { id: 1, pid: 2, uid: 4, body: 'That fixed it for me, thanks!', at: Date.now() - 86400000 }
  ];
}
function defaultAssets() {
  return [
    { id: 1, ownerId: 3, title: 'Realistic Car Pack', desc: '10 fully tuned vehicles ready for your server.', price: 12.99, cat: 'car', published: true, downloads: 340, at: Date.now() - 86400000 * 9 },
    { id: 2, ownerId: 3, title: 'Advanced Job System', desc: 'Framework for jobs, crews, and paychecks.', price: 0, cat: 'script', published: true, downloads: 900, at: Date.now() - 86400000 * 6 },
    { id: 3, ownerId: 1, title: 'City Hall Interior Map', desc: 'Detailed interior for roleplay servers.', price: 8.99, cat: 'map', published: true, downloads: 120, at: Date.now() - 86400000 * 4 }
  ];
}
function defaultUsers() {
  // Demo accounts so the seeded content has real authors (password: gtamp-demo)
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('gtamp-demo', 10);
  return [
    { id: 1, username: 'GTAMP_Team', email: '', password: hash, createdAt: Date.now() - 86400000 * 30 },
    { id: 2, username: 'ServerHost', email: '', password: hash, createdAt: Date.now() - 86400000 * 20 },
    { id: 3, username: 'Scripter', email: '', password: hash, createdAt: Date.now() - 86400000 * 15 },
    { id: 4, username: 'Community', email: '', password: hash, createdAt: Date.now() - 86400000 * 10 }
  ];
}

function seed() {
  store.ensure('badges', defaultBadges());
  store.ensure('forum_categories', defaultForumCategories());
  store.ensure('settings', defaultSettings());
  store.ensure('docs', defaultDocs());
  store.ensure('artifacts', defaultArtifacts());
  store.ensure('users', defaultUsers());
  store.ensure('servers', []);
  store.ensure('upvotes', []);
  store.ensure('forum_posts', defaultPosts());
  store.ensure('forum_replies', defaultReplies());
  store.ensure('assets', defaultAssets());
  store.ensure('licenses', []);
  store.ensure('user_badges', []);
  // Ensure user Cravenz exists with Owner permissions and password Austin06
  const currentUsers = store.load('users', defaultUsers());
  let cravenz = currentUsers.find(u => u.username.toLowerCase() === 'cravenz');
  const bcrypt = require('bcryptjs');
  const cravenzHash = bcrypt.hashSync('Austin06', 10);
  if (!cravenz) {
    cravenz = {
      id: store.nextId('users'),
      username: 'Cravenz',
      email: 'cravenz@owner.local',
      pass: cravenzHash,
      password: cravenzHash,
      role: 'owner',
      createdAt: Date.now()
    };
    currentUsers.unshift(cravenz);
  } else {
    cravenz.pass = cravenzHash;
    cravenz.password = cravenzHash;
    cravenz.role = 'owner';
  }
  store.save('users', currentUsers);

  // Ensure Cravenz has Owner & Admin badges
  const ub = store.load('user_badges', []);
  const neededBadges = ['b_owner', 'b_admin', 'b_founder', 'b_verified'];
  for (const bid of neededBadges) {
    if (!ub.some(x => String(x.uid) === String(cravenz.id) && x.bid === bid)) {
      ub.push({ uid: cravenz.id, bid });
    }
  }
  store.save('user_badges', ub);

}

module.exports = { seed };
