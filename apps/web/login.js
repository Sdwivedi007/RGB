const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const operatorId = formData.get("operator");
  const accessKey = formData.get("access");

  try {
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operator_id: operatorId,
        access_key: accessKey,
      }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    localStorage.setItem("rgb_token", data.token);
    window.location.href = "index.html";
  } catch (error) {
    alert("Login failed. Use demo/demo.");
  }
});
