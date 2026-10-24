# Pass It Forward Cleats
A starter static website for a community cleat exchange in Romeoville, Illinois.

## Before publishing
1. Open `config.js` and add your Supabase Project URL and **Publishable** key.
2. Never use a Supabase `service_role` or secret key in browser code.
3. The site expects these existing tables and columns:
   - `cleat_donations`: `donor_name`, `email`, `cleat_size`, `sport`, `condition`, `description`, `exchange_method`, `status`
   - `cleat_requests`: `requester_name`, `email`, `cleat_size`, `sport`, `quantity`, `exchange_method`, `status`
   - `cleat_inventory`: `sport`, `cleat_size`, `condition`, `quantity`, `status`, `created_at`
4. Public form submissions are set to `status = 'pending'`. Inventory displays only rows where `status = 'available'` and selects no donor contact fields.
5. Before using real information, review Supabase Row Level Security policies. Anonymous users should be allowed to insert pending submissions but must not be allowed to read donor/requester records. Only trusted administrators should be able to approve submissions and manage inventory. This starter does not yet include a secure administrator dashboard.
6. Test using non-sensitive sample information before sharing the site publicly.

## Files
- `index.html`: page structure and forms
- `styles.css`: page styling
- `app.js`: form and inventory behavior
- `config.js`: browser-safe Supabase connection settings
