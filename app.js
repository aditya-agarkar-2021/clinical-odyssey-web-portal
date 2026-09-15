const appContainer = document.getElementById('app-container');
let caseStudyData = null;
let currentStep = 1;
let currentCaseFile = '';
let userChoices = { investigations: {}, management: {} };
let currentExplanationHtml = '';

// Define your library of cases here
const caseDirectory = [
    { file: 'PD-D-005.json', title: 'Sore Subject (Aphthous Stomatitis)' },
    { file: 'PD-M-067.json', title: 'Buildup (Calcium Pyrophosphate Deposition Disease)' },
    { file: 'PD-M-119.json', title: 'Breathless (Aplastic Anemia)' },
    { file: 'PD-M-310.json', title: 'Gut Reaction (Irritable Bowel Syndrome)' }
];

// Fetch the JSON file dynamically
async function loadCase(filename) {
    try {
        currentCaseFile = filename;
        const response = await fetch(`json-files/${filename}`);
        caseStudyData = await response.json();
        
        // Reset state for the new case
        currentStep = 1;
        userChoices = { investigations: {}, management: {} };
        
        // Clear the container
        appContainer.innerHTML = ''; 
        
        renderHistory();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error("Error loading case:", error);
        appContainer.innerHTML = `<div class="p-6 bg-red-50 text-red-600 rounded">Error loading case study. Make sure you are running a local web server (like VS Code Live Server).</div>`;
    }
}

function renderHistory() {
    const section = document.createElement('div');
    section.id = 'step-1-container';
    section.innerHTML = `
        <div class="mb-8 border-b-2 border-gray-100 pb-5">
            <h1 class="text-3xl font-extrabold text-[#0b1e36] mb-2">${caseStudyData.name}</h1>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">${caseStudyData.hint}</span>
                <span class="text-xs text-gray-400 font-medium italic">Powered by <span> <img src="/images/co-logo-header.jpg" alt="Clinical Odyssey" class="h-7 md:h-8 object-contain"></span></span>
            </div>
        </div>
 
        <div class="border-b border-gray-200 pb-4 mb-6 flex items-center space-x-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#0b1e36] text-[#0b1e36] font-bold">1</span>
            <h2 class="text-xl font-bold text-[#0b1e36]">View details</h2>
        </div>
        
        <div class="clinical-content text-slate-700">
            ${caseStudyData.source.history_html}
        </div>
        
        <div class="mt-8 flex justify-end" id="action-btn-1">
            <button onclick="nextStep(2)" class="custom-button px-6 py-2 rounded shadow">Continue</button>
        </div>
    `;
    appContainer.appendChild(section);
}

function renderInvestigations() {
    let section = document.getElementById('step-2-container');
    let isNew = false;
    
    if (!section) {
        section = document.createElement('div');
        section.id = 'step-2-container';
        section.className = 'mt-12 pt-12 border-t-2 border-dashed border-gray-200'; 
        isNew = true;
    }

    let investigationsHtml = `
        <div class="border-b border-gray-200 pb-4 mb-6 flex items-center space-x-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#0b1e36] text-[#0b1e36] font-bold">2</span>
            <h2 class="text-xl font-bold text-[#0b1e36]">Investigate further</h2>
        </div>
        <div class="space-y-4">
    `;

    caseStudyData.source.investigations.forEach((inv, index) => {
        if (userChoices.investigations[index] === undefined) {
            userChoices.investigations[index] = false;
        }
        const isPerformed = userChoices.investigations[index];
        investigationsHtml += `
            <div class="border border-gray-200 rounded p-4 bg-gray-50 flex flex-col transition-all">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-slate-800">${inv.name}</span>
                    ${!isPerformed 
                        ? `<button onclick="performInvestigation(${index})" class="text-sm border border-gray-300 bg-white hover:bg-gray-100 px-4 py-1 rounded shadow-sm transition-colors">Perform</button>` 
                        : `<span class="text-sm text-[#0b1e36] font-bold">Performed</span>`
                    }
                </div>
                ${isPerformed ? `
                    <div class="mt-3 pt-3 border-t border-gray-200 text-sm text-slate-600 clinical-content">
                        ${inv.html}
                    </div>
                ` : ''}
            </div>
        `;
    });

    investigationsHtml += `
        </div>
        <div class="mt-8 flex justify-end" id="action-btn-2">
            <button onclick="nextStep(3)" class="custom-button px-6 py-2 rounded shadow">Continue</button>
        </div>
    `;
    
    section.innerHTML = investigationsHtml;
    if (isNew) {
        appContainer.appendChild(section);
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.performInvestigation = function(index) {
    userChoices.investigations[index] = true;
    renderInvestigations(); 
};

function renderManagement() {
    const section = document.createElement('div');
    section.id = 'step-3-container';
    section.className = 'mt-12 pt-12 border-t-2 border-dashed border-gray-200';

    let managementHtml = `
        <div class="border-b border-gray-200 pb-4 mb-6 flex items-center space-x-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#0b1e36] text-[#0b1e36] font-bold">3</span>
            <h2 class="text-xl font-bold text-[#0b1e36]">Identify actions</h2>
        </div>
        <div class="space-y-3">
    `;

    caseStudyData.source.management.forEach((action, index) => {
        managementHtml += `
            <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                <input type="checkbox" id="action-${index}" class="w-5 h-5 text-[#0b1e36] rounded border-gray-300 focus:ring-[#0b1e36]">
                <span class="font-medium text-slate-800">${action.name}</span>
            </label>
        `;
    });

    managementHtml += `
        </div>
        <div class="mt-8 flex justify-end" id="action-btn-3">
            <button onclick="submitCase()" class="custom-button px-6 py-2 rounded shadow">Submit</button>
        </div>
    `;

    section.innerHTML = managementHtml;
    appContainer.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.submitCase = function() {
    caseStudyData.source.management.forEach((_, index) => {
        const checkbox = document.getElementById(`action-${index}`);
        userChoices.management[index] = checkbox.checked;
    });
    nextStep(4);
};

// =========================================================
// HELPER FUNCTIONS: Explanation & Table Generation
// =========================================================

function stripLeadingHeading(html) {
    if (!html) return '';
    return html.replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/is, '');
}

function getExplanationPreview(html, maxLength = 160) {
    if (!html) return '';

    const cleanHtml = stripLeadingHeading(html);
    const plainText = cleanHtml
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim();

    if (!plainText) return '';
    return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trim()}...` : plainText;
}

window.toggleCaseExplanation = function() {
    const content = document.getElementById('case-explanation-content');
    const button = document.getElementById('toggle-explanation-btn');

    if (!content || !button) return;

    const isExpanded = content.dataset.expanded === 'true';
    const fallbackText = '<div class="text-sm text-slate-600 italic leading-relaxed">Diagnosis and reasoning coming soon.</div>';
    
    const previewText = getExplanationPreview(currentExplanationHtml);
    const fullBody = stripLeadingHeading(currentExplanationHtml);

    content.innerHTML = isExpanded
        ? `<div class="text-sm text-slate-600 italic leading-relaxed">${previewText || 'Diagnosis and reasoning coming soon.'}</div>`
        : (fullBody || fallbackText);

    content.dataset.expanded = String(!isExpanded);
    button.textContent = isExpanded ? 'Click here to read full analysis' : 'Hide';
};

// Shared helper to build scoring rows for investigations & management
function buildResultRows(items, userChoicesMap) {
    let scoreDelta = 0;
    let html = '';

    items.forEach((item, index) => {
        const performed = userChoicesMap[index];
        scoreDelta += performed ? item.score_performed : item.score_not_performed;
        const isCorrect = (performed && item.outcome === 'good') || (!performed && item.outcome === 'bad');
        const correctColor = isCorrect ? 'text-green-600' : 'text-red-600';

        html += `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 pr-4">${item.name}</td>
                <td class="py-3">${performed ? 'Performed' : 'Not performed'}</td>
                <td class="py-3 font-bold ${correctColor}">${isCorrect ? 'Correct' : 'Incorrect'}</td>
            </tr>
        `;
    });

    return { scoreDelta, html };
}

function renderResults() {
    const section = document.createElement('div');
    section.id = 'step-4-container';
    section.className = 'mt-12 pt-12 border-t-2 border-dashed border-gray-200';

    // Calculate score & render table using helper function
    const invResults = buildResultRows(caseStudyData.source.investigations, userChoices.investigations);
    const mgmtResults = buildResultRows(caseStudyData.source.management, userChoices.management);

    let finalScore = invResults.scoreDelta + mgmtResults.scoreDelta;

    let tableHtml = `
        <table class="w-full text-left text-sm mt-6 mb-10 border-collapse">
            <thead>
                <tr class="border-b-2 border-[#0b1e36] text-[#0b1e36]">
                    <th class="py-2">Item</th>
                    <th class="py-2">Your choice</th>
                    <th class="py-2">Result</th>
                </tr>
            </thead>
            <tbody>
                ${invResults.html}
                ${mgmtResults.html}
            </tbody>
        </table>
    `;

    if (finalScore > caseStudyData.maximum_score) finalScore = caseStudyData.maximum_score;
    if (finalScore < caseStudyData.minimum_score) finalScore = caseStudyData.minimum_score;
    const percentage = Math.round((finalScore / caseStudyData.maximum_score) * 100);

    // Build the dynamic case selector menu
    let otherCasesHtml = `
        <div class="mt-12 mb-10 pt-8 border-t-2 border-gray-200">
            <h3 class="text-xl font-bold text-[#0b1e36] mb-4">Try Another Case Study:</h3>
            <div class="flex flex-col space-y-3">
    `;
    caseDirectory.forEach(c => {
        if (c.file !== currentCaseFile) {
            otherCasesHtml += `
                <a href="#" onclick="event.preventDefault(); loadCase('${c.file}')" 
                   class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#0b1e36] transition-all text-[#0b1e36] font-semibold flex justify-between items-center">
                    <span>${c.title}</span>
                    <span class="text-xl">&rarr;</span>
                </a>
            `;
        }
    });
    otherCasesHtml += `</div></div>`;

    currentExplanationHtml = caseStudyData.source.explanation_html || '';
    const explanationPreview = getExplanationPreview(currentExplanationHtml);

    section.innerHTML = `
        <div class="text-center mb-10">
            <h3 class="text-lg font-semibold text-slate-600 uppercase tracking-widest">Your Score</h3>
            <p class="text-6xl font-bold text-[#0b1e36] mt-2">${percentage}%</p>
            <p class="text-sm text-gray-500 mt-1">(${finalScore} / ${caseStudyData.maximum_score} Points)</p>
        </div>

        ${tableHtml}

        <div class="clinical-content border-t border-gray-200 pt-8">
            <h3 class="text-xl font-bold text-[#0b1e36] mb-3">Diagnosis and reasoning</h3>

            <div id="case-explanation-content" data-expanded="false" class="rounded-lg border border-gray-200 bg-slate-50 px-4 py-3">
                <div class="text-sm text-slate-600 italic leading-relaxed">
                    ${explanationPreview || 'Diagnosis and reasoning coming soon.'}
                </div>
            </div>
            <div class="mt-4 flex justify-center">
                <button type="button" id="toggle-explanation-btn" onclick="toggleCaseExplanation()" class="custom-button px-5 py-2 rounded shadow text-sm font-semibold">
                    Click here to read full analysis
                </button>
            </div>
        </div>

        ${otherCasesHtml}

        <!-- The WhatsApp Hook CTA -->
        <div class="p-6 bg-[#f0fdf4] border-2 border-green-500 rounded-xl text-center shadow-md mb-10">
            <h3 class="text-2xl font-bold text-green-800 mb-2">Want full access to the library?</h3>
            <p class="text-green-700 mb-6">Connect your practise to unlock hundreds of such interactive case studies via ConnectOD.</p>

            <div class="flex flex-col items-center">
                <a href="https://wa.me/message/QSTTGSWIF7LED1" target="_blank" class="inline-flex items-center justify-center bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-lg w-full md:w-auto">
                    Claim 1-Month FREE Access on WhatsApp
                </a>
                <span class="text-xs sm:text-sm text-green-800 mt-3 font-medium">
                    (Can be extended up to 3-months based on your 1-month usage)
                </span>
            </div>
        </div>
    `;
    
    appContainer.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextStep(step) {
    const previousBtn = document.getElementById(`action-btn-${step - 1}`);
    if (previousBtn) previousBtn.style.display = 'none';

    currentStep = step;
    
    if (step === 2) renderInvestigations();
    else if (step === 3) renderManagement();
    else if (step === 4) renderResults();
}

// Start the app by loading the first case
loadCase('PD-D-005.json');