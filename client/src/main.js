// Simple JavaScript app without React
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #005191; margin-bottom: 20px;">Santa Barbara 211 Resource Finder</h1>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 10px;">Welcome to the Resource Finder</h2>
        <p style="color: #666; line-height: 1.6;">
          This application connects you with essential community services in Santa Barbara County.
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 30px;">
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #005191; margin-bottom: 5px;">🏠 Housing</h3>
          <p style="color: #666; font-size: 14px;">Find shelter and housing assistance</p>
        </div>
        
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #005191; margin-bottom: 5px;">🍽️ Food</h3>
          <p style="color: #666; font-size: 14px;">Locate food banks and meal programs</p>
        </div>
        
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #005191; margin-bottom: 5px;">🏥 Healthcare</h3>
          <p style="color: #666; font-size: 14px;">Access medical and health services</p>
        </div>
        
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #005191; margin-bottom: 5px;">👨‍👩‍👧‍👦 Family</h3>
          <p style="color: #666; font-size: 14px;">Support for children and families</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 5px;">
        <p style="color: #856404;">
          <strong>Note:</strong> This is a simplified view. The full application provides comprehensive search, 
          real-time 211 data integration, and detailed resource information.
        </p>
      </div>
    </div>
  `;
});