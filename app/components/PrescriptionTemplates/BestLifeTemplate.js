// lib/prescriptionTemplate.js
export const BestLifeTemplate = (data) => `
  <div style="page-break-after: always;">
    <div class="logo-header">
      <img src="https://cdn.healthtechalpha.com/static/resized/social_media_image/startup_data_images/34054.png" alt="Logo" width="150" height="auto" />
      <img src="https://www.maxicare.com.ph/wp-content/uploads/2022/11/new-home-logo.png" alt="Logo" width="150" height="auto" />
    </div>

    <div class="prescription-header">
      <div class="prescription-header-item">
        <strong>Patient:</strong>
        <span>${data?.patientName ?? 'TEST DO NOT PROCESS'}</span>
      </div>

      <div class="prescription-header-item">
        <strong>Consultation Date:</strong>
        <span>${data?.consultDate ?? 'TEST DO NOT PROCESS'}</span>
      </div>

      <div class="prescription-header-item">
        <strong>Birthday:</strong>
        <span>${data?.birthday ?? 'TEST DO NOT PROCESS'}</span>
      </div>

      <div class="prescription-header-item">
        <strong>Sex:</strong>
        <span>${data?.sex ?? 'TEST DO NOT PROCESS'}</span>
      </div>
    </div>

    <hr class="divider" />

    <h1 class="rx-title">Rx</h1>

    <div class="message-box">
      <p>Please note that this prescription is for informational purposes only. It is not a medical prescription and should not be used as such.</p>
    </div>

    <br />

    <div class="med-container">
    ${data?.medicines?.map(m => `
      <div class="med-item">
        <div class="med-header">
          <div class="med-title">${m.name}</div>
          <div class="med-qty">#${m.quantity}</div>
        </div>

        <div class="med-signa">
          Signa: ${m.sig}
        </div>
      </div>
    `).join("")}
    </div>
    
    <footer>
      <div class="footer-text">
        <div class="footer-item">
          <strong>Doctor:</strong>
          <span>${data?.doctorName ?? 'TEST DO NOT PROCESS'}</span>
        </div>

        <div class="footer-item">
          <strong>Specialization:</strong>
          <span>${data?.specialization ?? 'TEST DO NOT PROCESS'}</span>
        </div>

        <div class="footer-item">
          <strong>PRC Number:</strong>
          <span>${data?.prcNo ?? 'TEST DO NOT PROCESS'}</span>
        </div>

        <div class="footer-item">
          <strong>PTR Number:</strong>
          <span>${data?.ptrNo ?? 'TEST DO NOT PROCESS'}</span>
        </div>

        <br />

        <div class="footer-item">
          <span>For any further clarifications or assistance, please contact us at info@medgrocer.com</span>
        </div>

        <br />

        <div class="footer-item">
          <span style="color: #0D6D6E; font-weight: 700;">MG HEALTH SOLUTIONS INC.</span>
        </div>

        <div class="footer-item">
          <span>24F Centuria Medical Makati, Kalayaan cor. Salamanca St.,</span>
        </div>

        <div class="footer-item">
          <span>Poblacion, Makati, 1210, Metro Manila</span>
        </div>
      </div>
      <div class="footer-img">
        <img src="http://localhost:3000/image.png" alt="Signature" width="150" height="auto" />
      </div>
    </footer>
  </div>
`;