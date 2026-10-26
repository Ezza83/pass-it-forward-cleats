(() => {
  const ready = window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY &&
    !window.SUPABASE_URL.includes('PASTE_') && !window.SUPABASE_PUBLISHABLE_KEY.includes('PASTE_') && window.supabase;
  const $ = (id) => document.getElementById(id);
  let client = null;
  if (ready) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);

  function configMessage() {
    return 'Website setup is not finished yet. The Supabase connection details need to be added to config.js.';
  }
  function setMessage(id, message, bad = false) {
    const el = $(id); el.textContent = message; el.classList.toggle('error', bad);
  }
  async function loadInventory() {
    const target = $('inventoryList');
    if (!client) { target.innerHTML = `<p>${configMessage()}</p>`; return; }
    target.innerHTML = '<p>Loading inventory…</p>';
    let query = client.from('cleat_inventory').select('id, sport, cleat_size, condition, quantity, status').eq('status', 'available').order('created_at', { ascending: false });
    const sport = $('sportFilter').value; const size = $('sizeFilter').value.trim();
    if (sport) query = query.eq('sport', sport);
    if (size) query = query.ilike('cleat_size', `%${size}%`);
    const { data, error } = await query;
    if (error) { target.innerHTML = '<p>Inventory could not be loaded yet. The database access settings may need to be checked.</p>'; return; }
    if (!data || data.length === 0) { target.innerHTML = '<p>No available cleats match that search right now. Please check again later.</p>'; return; }
    target.replaceChildren(...data.map(item => {
      const card = document.createElement('article'); card.className = 'inventory-card';
      const h = document.createElement('h3'); h.textContent = `${item.sport} cleats`;
      const p = document.createElement('p'); p.textContent = `Size: ${item.cleat_size} · Condition: ${item.condition} · Quantity: ${item.quantity}`;
      card.append(h, p); return card;
    }));
  }
  $('searchInventory').addEventListener('click', loadInventory);
  $('donationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client) { setMessage('donationMessage', configMessage(), true); return; }
    const form = new FormData(event.currentTarget);
    const record = { donor_name: form.get('donor_name').trim(), email: form.get('email').trim(), cleat_size: form.get('cleat_size').trim(), sport: form.get('sport'), condition: form.get('condition'), description: form.get('description').trim() || null, exchange_method: form.get('exchange_method'), status: 'pending' };
    const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
    const { error } = await client.from('cleat_donations').insert(record);
    button.disabled = false;
    if (error) { setMessage('donationMessage', 'We could not submit this donation. Please check the database policies and try again.', true); return; }
    form.reset(); setMessage('donationMessage', 'Thank you! Your donation was submitted for review. It will not appear publicly until approved.');
  });
  $('requestForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client) { setMessage('requestMessage', configMessage(), true); return; }
    const form = new FormData(event.currentTarget);
    const record = { requester_name: form.get('requester_name').trim(), email: form.get('email').trim(), cleat_size: form.get('cleat_size').trim(), sport: form.get('sport'), quantity: Number(form.get('quantity')), exchange_method: form.get('exchange_method'), status: 'pending' };
    const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
    const { error } = await client.from('cleat_requests').insert(record);
    button.disabled = false;
    if (error) { setMessage('requestMessage', 'We could not submit this request. Please check the database policies and try again.', true); return; }
    event.currentTarget.reset(); setMessage('requestMessage', 'Thank you! Your request was submitted for review.');
  });
  loadInventory();
})();
