
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "Signing in...";

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Sign-in failed. Check your email and password.";
    return;
  }

  const { data: adminRecord, error: adminError } =
    await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

  if (adminError || !adminRecord) {
    await supabaseClient.auth.signOut();
    loginMessage.textContent =
      "This account is not authorized to access the admin area.";
    return;
  }

  loginMessage.textContent = "Admin login successful!";
});
