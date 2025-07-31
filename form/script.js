(function() {
    // https://dashboard.emailjs.com/admin/account
    emailjs.init({
      publicKey: "LpjT6PFXqnLEJni6E",
    });
})();

const googleSheetWebhookURL = "https://script.google.com/macros/s/AKfycbxkFO4k5Gz6hBRnpsEaPb-bKsS7_Rd6kSl6EZ2zx-9KICNrNHgADnOu0FphfMfl2ikq/exec";
const msg = document.querySelector(".form-message");
const loader = document.querySelector(".loader");
// 1. PayPal Button Setup
paypal.HostedButtons({
  hostedButtonId: "8QMJ5AYWQ8UC6",
}).render("#paypal-container-8QMJ5AYWQ8UC6");

// 2. فعال‌سازی دکمه Submit بعد از پرداخت موفق
window.addEventListener("message", function (event) {
  if (event.origin.includes("paypal.com")) {
    if (event.data && event.data.event === "hostedButtonPaymentAuthorized") {
      document.getElementById("submit-wrapper").style.display = "block";
      document.getElementById("paypal-container-8QMJ5AYWQ8UC6").style.display = "none";
    }
  }
});
window.onload = function() {
    document.getElementById("contact-form").addEventListener("submit", function(event) {
        event.preventDefault();

        loader.classList.add("show");
        msg.innerHTML = "";
        msg.classList.remove("show");

        const form = this;

        // ارسال ایمیل با EmailJS
        emailjs.sendForm("service_4yvzeq8", "template_px597ka", form).then(
            function() {
                // ارسال داده به Google Sheets بعد از ارسال ایمیل موفق
                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());

                fetch(googleSheetWebhookURL, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams(formDataObj)
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Data saved to Google Sheet:", data);
                })
                .catch(error => {
                    console.error("Error saving to Google Sheet:", error);
                });

                loader.classList.remove("show");
                msg.innerHTML = "<span class='success-msg'>Email Sent and Data Saved!</span>";
                msg.classList.add("show");
                form.reset();
                setTimeout(() => msg.classList.remove("show"), 3000);
            },
            function(error){
                loader.classList.remove("show");
                msg.classList.add("show");
                msg.innerHTML = "<span class='error-msg'>Email Not Sent</span>";
                console.error("EmailJS error:", error);
            }
        );
    });
};
