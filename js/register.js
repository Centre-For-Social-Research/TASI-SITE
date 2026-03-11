document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');
    const downloadPassBtn = document.getElementById('downloadPass');

    // DOM Elements for Pass
    const passName = document.getElementById('passName');
    const passOrg = document.getElementById('passOrg');
    const passCat = document.getElementById('passCat');
    const passID = document.getElementById('passID');
    const qrcodeContainer = document.getElementById('qrcode');
    const delegatePass = document.getElementById('delegatePass');

    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get Input Values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const org = document.getElementById('organisation').value.trim();
            const cat = document.getElementById('category').value;
            const country = document.getElementById('country').value;

            // Generate Unique Delegate ID
            const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            const randomID = generateRandomString(6);
            const uniqueID = `TASI26-${initials}-${randomID}`;

            // Populate Pass Data
            passName.innerText = `${firstName} ${lastName}`;
            passOrg.innerText = org;
            passCat.innerText = cat;
            passID.innerText = uniqueID;

            // Create pass payload for QR Code
            const qrPayload = JSON.stringify({
                id: uniqueID,
                name: `${firstName} ${lastName}`,
                org: org,
                cat: cat,
                event: 'TASI 2026'
            });

            // Clear previous QR code if any
            qrcodeContainer.innerHTML = '';

            // Generate QR Code
            new QRCode(qrcodeContainer, {
                text: qrPayload,
                width: 100,
                height: 100,
                colorDark : "#0F172A",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });

            // Show Modal
            successModal.style.display = 'flex';
            setTimeout(() => {
                successModal.classList.add('active');
            }, 10);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            successModal.classList.remove('active');
            setTimeout(() => {
                successModal.style.display = 'none';
                registrationForm.reset();
            }, 300);
        });
    }

    // Canvas Download 
    if (downloadPassBtn) {
        downloadPassBtn.addEventListener('click', () => {
            // Add a small delay to ensure QR code renders perfectly before canvas copy
            setTimeout(() => {
                html2canvas(delegatePass, {
                    scale: 2, // High resolution
                    backgroundColor: null
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `TASI2026-Pass-${passID.innerText}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                });
            }, 200);
        });
    }
});
