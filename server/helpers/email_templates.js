const moment = require('moment'); 

module.exports = {
    welcomeEmailTemplate: (name) => {
        var subject = "Welcome to Laptop Skins | Style Your Tech, Express Your Vibe!";
        var msg = " \
        <p>Welcome to Laptop Skins AE LLC! We’re thrilled to have you as part of our community. Your decision to customize your laptop with one of our unique skins is something we take pride in.</p> \
        <p>At Laptop Skins AE, we believe that your laptop should reflect your style and personality. Our team is dedicated to providing you with high-quality skins that not only look great but also protect your device.</p> \
        <p>We invite you to explore our latest collections, featuring a range of themes from sleek minimalist designs to vibrant, eye-catching patterns. Don’t forget to check out our custom design service if you have a specific look in mind!</p> \
        <p>If you have any questions or need assistance, our customer support team is here to help. You can reach us at support@laptopskins.ae</p> \
        <p>Thank you for choosing Laptop Skins AE. We can’t wait to see how you style your tech!</p> \
        <p class='footer'>Your Personalized Laptop Skin Experience!,<br>The Laptop Skins AE Team 🌟</p> \
        <p> \
            <br /> \
            Team of  \
            <a title='Laptop Skins AE' href='https://www.laptopskins.ae/'> \
            Laptop Skins AE \
            </a> \
        </p> \
        ";
        return {
            subject: subject,
            msg: msg
        }
    },
    userRegisterationEmail: (email, password) => {
        var subject = "Your Credentials for Laptop Skins AE LLC";
        var msg = " \
        <p> \
            Your account has been successfully registered with Laptop Skins. Kindly find the following summary of your account. \
        </p> \
        <p> \
            Email: " + email + " \
            <br /> \
            Password: " + password + " \
        </p> \
        <p> \
            It is highly recommended for best security purposes that you occasionally change your password every 2-3 months. Our systems at Laptop Skins implement the best security practices and will continue to do so. \
        </p> \
        <p> \
            If you forget your password or you need to reset it, you can always use the Mobile Application or use the web at the following address to do so; \
        </p> \
        <p> \
            <a title='Reset Password' href='https://www.laptopskins.ae/reset/password' target='_blank' rel='noopener'> \
                Reset Password \
            </a> \
        </p> \
        <p> \
            For any further queries, regarding your account, please feel free to drop us an email at \
            <a href='mailto:support@laptopskins.ae'> \
                support@laptopskins.Ae \
            </a> \
        </p> \
        ";

        return {
            subject: subject,
            msg: msg
        }
    },
    verificationEmailTemplate: (email_auth_code) => {
        return {
            subject: "Verify Email Address | Laptop Skins AE LLC",
            msg: "\
                <p>Your Email Verification Code: <span style='font-weight: bold; font-size: 20px; color: grey;'>" + email_auth_code + "</span></p> \
                <p> \
                This email is sent to verify your email address, Click on the following link to verify your email address \
                </p>\
                <a target='_blank' rel='noopener' href='https://www.tripjojo.com/verify/email/" + email_auth_code + "'>https://www.tripjojo.com/verify/email/" + email_auth_code + "</a>\
            ",
        }
    },
    newBookingEmailTemplate: (data) => {
        //Create Items
        var tripDetails = "<h4>Trip Details:</h4>";
        for (let i = 0; i < data.checkout.items.length; i++) {
            const elem = data.checkout.items[i];
            tripDetails += "\
            <li>\
                <b>" + elem.title + "</b> \
                <div>Date: " + moment(elem.date).format("LL") + "</div> \
                <div>Adults x " + elem.adults + "</div> \
                <div>Children x " + elem.children + "</div> \
            </li>\
            ";
        }

        return {
            subject: "Your TripJoJo Adventure Awaits! Booking Confirmation #" + data.booking_id,
            msg: "\
            <p>Dear " + data.name + ",</p> \
            <p>Thank you for choosing TripJoJo for your upcoming journey! We're thrilled to confirm your booking and can't wait to be part of your adventure. Below you'll find the details of your travel itinerary and booking information.</p>\
            \
            <h3>Booking Confirmation #" + data.booking_id + "</h3> \
            \
            <h4>Traveler Information:</h4>\
            <ul>\
                <li>Name: " + data.name + "</li>\
                <li>Contact Email: " + data.email + "</li>\
                <li>Contact Number: " + data.phone + "</li>\
            </ul>\
            " + tripDetails + " \
            <p><strong>Total Price:</strong> AED " + data.checkout.total + "</p> \
            <h4>Payment Details:</h4> \
            <ul> \
                <li>Payment Method: Bank</li> \
                <li>Payment Status: Pending Payment</li> \
            </ul> \
            <p> \
            The Bank Details are as Follows; <br> \
            Account holder: TRIP JO.JO PORTAL CO. L.L.C <br> \
            IBAN: AE800860000009124852844 <br> \
            BIC: WIOBAEADXXX <br> \
            Business address: <br> \
            Office No 43-44, Building of Dubai Municipality, Bur Dubai-Al Fahidi, Dubai, United Arab Emirates  <br> \
            </p> \
            <h4>Important Information:</h4>\
            <ul> \
                <li>Please ensure that your travel documents are up to date.</li> \
                <li>Review our travel tips and guidelines to prepare for your trip: <a href='https://www.tripjojo.com/travel'>Link to Travel Tips</a></li> \
                <li>For changes or cancellations, please refer to our policies: <a href='https://www.tripjojo.com/about/privacy-policy'>Link to Policies</a></li> \
            </ul> \
            <p><strong>Need Assistance?</strong><br> \
            Our customer support team is here for you 24/7. Should you have any questions or need further assistance, don't hesitate to reach out at <a href='mailto:support@tripjojo.com'>support@tripjojo.com</a> or call us at [Support Phone Number].</p> \
            <p>We're excited to be part of your journey and are committed to making it unforgettable. Safe travels, and see you soon!</p> \
            <p>Warm regards,<br> \
            The TripJoJo Team</p> \
            "
        }
    }
}