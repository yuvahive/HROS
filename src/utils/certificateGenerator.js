/**
 * Certificate Generator for Internship Completion
 * Generates professional certificates with internship details
 * Uses browser canvas API - no external dependencies required
 */

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const generateInternshipCertificate = async (internshipData) => {
  try {
    const certificateHTML = createCertificateHTML(internshipData)
    
    // Create temporary container
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = certificateHTML
    tempDiv.style.position = 'fixed'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '-9999px'
    tempDiv.style.width = '1200px'
    tempDiv.style.height = '800px'
    tempDiv.style.backgroundColor = 'white'
    document.body.appendChild(tempDiv)
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create canvas from HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1200,
      height: 800
    })
    
    // Create download link
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `Certificate_${internshipData.personName.replace(/\s+/g, '_')}_${internshipData.id}.png`
    link.click()
    
    // Cleanup
    document.body.removeChild(tempDiv)
    
    return {
      success: true,
      fileName: link.download,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Certificate generation failed:', error)
    // Fallback: generate as HTML document
    return await generateCertificateAsHTML(internshipData)
  }
}

export const generateCertificateAsHTML = async (internshipData) => {
  try {
    const certificateHTML = createCertificateHTML(internshipData)
    
    // Create a new window and print
    const printWindow = window.open('', '', 'width=1200,height=800')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${internshipData.personName}</title>
          <style>
            body { margin: 0; padding: 0; font-family: Georgia, serif; }
            #certificate { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div id="certificate">${certificateHTML}</div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
    
    return {
      success: true,
      message: 'Certificate opened in print dialog',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('HTML certificate generation failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Fallback: Simple canvas-based certificate
export const generateCertificateAsImage = async (internshipData) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    
    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Gradient border
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Content area (white)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80)
    
    // Text styles
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'center'
    
    // Title
    ctx.font = 'bold 48px Georgia'
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 100)
    
    // Decorative line
    ctx.strokeStyle = '#667eea'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(300, 140)
    ctx.lineTo(canvas.width - 300, 140)
    ctx.stroke()
    
    // Body text
    ctx.font = 'italic 24px Georgia'
    ctx.fillStyle = '#666666'
    ctx.fillText('This is to certify that', canvas.width / 2, 200)
    
    // Name
    ctx.font = 'bold 40px Georgia'
    ctx.fillStyle = '#000000'
    ctx.fillText(internshipData.personName.toUpperCase(), canvas.width / 2, 280)
    
    // Program details
    ctx.font = 'italic 20px Georgia'
    ctx.fillStyle = '#666666'
    ctx.fillText('has successfully completed the', canvas.width / 2, 340)
    
    ctx.font = 'bold 28px Georgia'
    ctx.fillStyle = '#000000'
    ctx.fillText(internshipData.position, canvas.width / 2, 400)
    
    ctx.font = '18px Georgia'
    ctx.fillStyle = '#333333'
    const startDate = new Date(internshipData.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const endDate = new Date(internshipData.endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    ctx.fillText(`${startDate} to ${endDate}`, canvas.width / 2, 450)
    
    // Score
    if (internshipData.finalScore) {
      ctx.font = 'bold 32px Georgia'
      ctx.fillStyle = '#667eea'
      ctx.fillText(`Final Score: ${internshipData.finalScore}/10`, canvas.width / 2, 530)
    }
    
    // Footer
    ctx.font = '14px Georgia'
    ctx.fillStyle = '#999999'
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    ctx.fillText(`Certificate ID: ${internshipData.id}`, canvas.width / 2, 680)
    ctx.fillText(`Issued: ${generatedDate}`, canvas.width / 2, 720)
    
    // Download
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `Certificate_${internshipData.personName.replace(/\s+/g, '_')}_${internshipData.id}.png`
    link.click()
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Canvas certificate generation failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const createCertificateHTML = (internshipData) => {
  const startDate = new Date(internshipData.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const endDate = new Date(internshipData.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const overallScore = internshipData.finalScore || 'N/A'
  
  return `
    <div style="
      width: 100%;
      max-width: 1000px;
      padding: 60px;
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      text-align: center;
      color: white;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    ">
      <!-- Decorative elements -->
      <div style="
        position: absolute;
        top: 30px;
        left: 30px;
        right: 30px;
        bottom: 30px;
        border: 3px solid rgba(255,255,255,0.8);
        border-radius: 10px;
        pointer-events: none;
      "></div>
      
      <!-- Content wrapper -->
      <div style="position: relative; z-index: 1;">
        <!-- Header -->
        <h1 style="
          font-size: 56px;
          font-weight: bold;
          margin: 0 0 30px 0;
          letter-spacing: 3px;
        ">CERTIFICATE OF COMPLETION</h1>
        
        <div style="
          height: 3px;
          background: rgba(255,255,255,0.9);
          width: 300px;
          margin: 0 auto 40px;
        "></div>
        
        <!-- Body -->
        <p style="font-size: 20px; margin: 15px 0; font-style: italic;">This is to certify that</p>
        
        <h2 style="
          font-size: 48px;
          font-weight: bold;
          margin: 25px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        "        >${escapeHtml(internshipData.personName)}</h2>
        
        <p style="font-size: 20px; margin: 15px 0; font-style: italic;">has successfully completed the</p>
        
        <!-- Program Details -->
        <div style="
          background: rgba(255,255,255,0.15);
          padding: 30px;
          border-radius: 10px;
          margin: 30px 0;
          backdrop-filter: blur(10px);
        ">
          <p style="font-size: 28px; font-weight: bold; margin: 10px 0;">
            ${escapeHtml(internshipData.position)}
          </p>
          <p style="font-size: 18px; margin: 8px 0;">
            <strong>${escapeHtml(internshipData.department)}</strong> Department
          </p>
          <p style="font-size: 18px; margin: 8px 0;">
            Duration: ${escapeHtml(String(internshipData.durationWeeks))} weeks
          </p>
          <p style="font-size: 18px; margin: 8px 0;">
            From: <strong>${escapeHtml(internshipData.college)}</strong>
          </p>
          <p style="font-size: 18px; margin: 8px 0;">
            ${startDate} to ${endDate}
          </p>
        </div>
        
        <!-- Score -->
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 20px 40px;
          border-radius: 8px;
          margin: 30px 0;
        ">
          <p style="font-size: 16px; margin: 0 0 10px 0;">Overall Performance Rating</p>
          <p style="font-size: 48px; font-weight: bold; margin: 0;">
            ${overallScore}/10
          </p>
        </div>
        
        <!-- Signatures -->
        <div style="
          display: flex;
          gap: 100px;
          justify-content: center;
          margin: 60px 0 30px 0;
        ">
          <div style="text-align: center;">
            <div style="
              height: 1px;
              background: rgba(255,255,255,0.8);
              width: 180px;
              margin-bottom: 10px;
            "></div>
            <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">
              ${escapeHtml(internshipData.mentorName || 'Mentor')}
            </div>
            <div style="font-size: 14px; margin-top: 5px;">Mentor & Supervisor</div>
          </div>
          <div style="text-align: center;">
            <div style="
              height: 1px;
              background: rgba(255,255,255,0.8);
              width: 180px;
              margin-bottom: 10px;
            "></div>
            <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">HR Department</div>
            <div style="font-size: 14px; margin-top: 5px;">Authorized Signature</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="
          margin-top: 40px;
          font-size: 13px;
          border-top: 1px solid rgba(255,255,255,0.5);
          padding-top: 20px;
        ">
          <p style="margin: 5px 0;">Certificate ID: ${internshipData.id}</p>
          <p style="margin: 5px 0;">Issued: ${generatedDate}</p>
          <p style="margin: 5px 0; font-style: italic;">This certificate recognizes successful completion and excellent performance during the internship program.</p>
        </div>
      </div>
    </div>
  `
}
