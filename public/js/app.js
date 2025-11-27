// Main application initialization
console.log('🚀 StoryWeaver initializing...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📖 StoryWeaver loaded successfully');
    
    // Initialize ML systems if they exist on this page
    if (typeof mlAnalyzer !== 'undefined') {
        console.log('🔬 ML Analyzer initialized');
    }
    
    if (typeof mlTracker !== 'undefined') {
        console.log('📊 ML Tracker initialized');
    }
    
    // Test character extraction with a simple example
    if (typeof mlAnalyzer !== 'undefined') {
        setTimeout(() => {
            try {
                const testText = "John met Sarah at the cafe. Dr. Smith watched them from across the room.";
                const testResult = mlAnalyzer.extractCharactersFromText(testText, 'Test Story');
                console.log('🧪 Character extraction test:', testResult);
            } catch (error) {
                console.log('🧪 Character extraction test skipped (not on writer page)');
            }
        }, 1000);
    }
});

// Global utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});