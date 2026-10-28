
const dashboardClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);

const message = document.getElementById("dashboardMessage");
const donationsSection = document.getElementById("donationsSection");
const donationsList = document.getElementById("donationsList");
const requestsSection = document.getElementById("requestsSection");
const requestsList = document.getElementById("requestsList");
const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");

async function loadDashboard() {
  message.textContent = "Checking administrator access...";

  const { data: sessionData, error: sessionError } =
    await dashboardClient.auth.getSession();

  const session = sessionData?.session;

  if (sessionError || !session) {
    message.textContent = "Please sign in first.";
    const returnLink = document.createElement("a");
    returnLink.href = "admin.html";
    returnLink.textContent = "Go to Admin Login";
    message.appendChild(document.createElement("br"));
    message.appendChild(returnLink);
    return;
  }

  const { data: adminRecord, error: adminError } =
    await dashboardClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

  if (adminError || !adminRecord) {
    await dashboardClient.auth.signOut();
    message.textContent = "Administrator access denied.";
    return;
  }

  message.textContent = "Signed in as an authorized administrator.";
  donationsSection.hidden = false;
  refreshButton.hidden = false;
  logoutButton.hidden = false;

  await loadPendingDonations();
  await loadPendingRequests();
}

async function loadPendingDonations() {
  donationsList.replaceChildren();
  message.textContent = "Loading pending donations...";

  const { data, error } = await dashboardClient
    .from("cleat_donations")
    .select("id, cleat_size, sport, condition, description, exchange_method, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    message.textContent =
      "Could not load donations. Please check your access policies.";
    return;
  }

  message.textContent = data.length
    ? `${data.length} pending donation(s) found.`
    : "There are no pending donations.";

  for (const donation of data) {
    const card = document.createElement("article");
    card.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = `${donation.sport} cleats — Size ${donation.cleat_size}`;
    card.appendChild(heading);

    const details = document.createElement("p");
    details.textContent =
      `Condition: ${donation.condition || "Not specified"} | ` +
      `Exchange: ${donation.exchange_method || "Not specified"}`;
    card.appendChild(details);

    if (donation.description) {
      const description = document.createElement("p");
      description.textContent = donation.description;
      card.appendChild(description);
    }

    const approveButton = document.createElement("button");
    approveButton.type = "button";
    approveButton.textContent = "Approve Donation";

    approveButton.addEventListener("click", async () => {
      approveButton.disabled = true;
      approveButton.textContent = "Approving...";



      const { error: approvalError } = await dashboardClient.rpc(
        "approve_cleat_donation",
        { p_donation_id: donation.id }
      );

      if (approvalError) {
        message.textContent =
          "Approval failed. " + approvalError.message;
        approveButton.disabled = false;
        approveButton.textContent = "Approve Donation";
        return;
      }

      message.textContent =
        "Donation approved and added to inventory.";
      await loadPendingDonations();
    });

    card.appendChild(approveButton);
    donationsList.appendChild(card);
  }
}
async function loadPendingRequests() {
  requestsList.replaceChildren();
  requestsSection.hidden = false;

  const { data, error } = await dashboardClient
    .from("cleat_requests")
    .select("id, requester_name, cleat_size, sport, quantity, exchange_method, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    requestsList.textContent =
      "Could not load requests. Please check administrator access policies.";
    return;
  }

  if (!data.length) {
    requestsList.textContent = "There are no pending cleat requests.";
    return;
  }

  for (const request of data) {
    const card = document.createElement("article");
    card.className = "card";

    const heading = document.createElement("h3");
    heading.textContent =
      `${request.sport} cleats — Size ${request.cleat_size}`;
    card.appendChild(heading);

    const details = document.createElement("p");
    details.textContent =
      `Requester: ${request.requester_name} | ` +
      `Quantity: ${request.quantity} | ` +
      `Exchange: ${request.exchange_method || "Not specified"}`;
    card.appendChild(details);
const approveRequestButton = document.createElement("button");
approveRequestButton.type = "button";
approveRequestButton.textContent = "Approve Request";

approveRequestButton.addEventListener("click", async () => {
  approveRequestButton.disabled = true;
  approveRequestButton.textContent = "Approving...";

  const { error } = await dashboardClient.rpc(
    "review_cleat_request",
    {
      p_request_id: request.id,
      p_new_status: "approved"
    }
  );

  if (error) {
    alert("Could not approve request: " + error.message);
    approveRequestButton.disabled = false;
    approveRequestButton.textContent = "Approve Request";
    return;
  }

  alert("Request approved!");
  await loadPendingRequests();
});

card.appendChild(approveRequestButton);
    const rejectRequestButton = document.createElement("button");
rejectRequestButton.type = "button";
rejectRequestButton.textContent = "Reject Request";

rejectRequestButton.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to reject this cleat request?")) {
    return;
  }

  rejectRequestButton.disabled = true;
  rejectRequestButton.textContent = "Rejecting...";

  const { error } = await dashboardClient.rpc(
    "review_cleat_request",
    {
      p_request_id: request.id,
      p_new_status: "rejected"
    }
  );

  if (error) {
    alert("Could not reject request: " + error.message);
    rejectRequestButton.disabled = false;
    rejectRequestButton.textContent = "Reject Request";
    return;
  }

  alert("Request rejected!");
  await loadPendingRequests();
});

card.appendChild(rejectRequestButton);
    requestsList.appendChild(card);
  }
}
refreshButton.addEventListener("click", async () => {
  await loadPendingDonations();
  await loadPendingRequests();
});

logoutButton.addEventListener("click", async () => {
  await dashboardClient.auth.signOut();
  window.location.href = "admin.html";
});

dashboardClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    window.location.href = "admin.html";
  }
});

loadDashboard();
