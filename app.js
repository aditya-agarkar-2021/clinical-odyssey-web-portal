const appContainer = document.getElementById('app-container');
let caseStudyData = null;
let currentStep = 1;
let currentCaseFile = '';
let userChoices = { investigations: {}, management: {} };

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
        <!-- NEW: Dynamic Title and Powered By text -->
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
}

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
}

function renderResults() {
    const section = document.createElement('div');
    section.id = 'step-4-container';
    section.className = 'mt-12 pt-12 border-t-2 border-dashed border-gray-200';

    let finalScore = 0;
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
    `;

    caseStudyData.source.investigations.forEach((inv, i) => {
        const performed = userChoices.investigations[i];
        finalScore += performed ? inv.score_performed : inv.score_not_performed;
        const isCorrect = (performed && inv.outcome === 'good') || (!performed && inv.outcome === 'bad');
        const correctColor = isCorrect ? 'text-green-600' : 'text-red-600';
        tableHtml += `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 pr-4">${inv.name}</td>
                <td class="py-3">${performed ? 'Performed' : 'Not performed'}</td>
                <td class="py-3 font-bold ${correctColor}">${isCorrect ? 'Correct' : 'Incorrect'}</td>
            </tr>
        `;
    });

    caseStudyData.source.management.forEach((action, i) => {
        const performed = userChoices.management[i];
        finalScore += performed ? action.score_performed : action.score_not_performed;
        const isCorrect = (performed && action.outcome === 'good') || (!performed && action.outcome === 'bad');
        const correctColor = isCorrect ? 'text-green-600' : 'text-red-600';
        tableHtml += `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 pr-4">${action.name}</td>
                <td class="py-3">${performed ? 'Performed' : 'Not performed'}</td>
                <td class="py-3 font-bold ${correctColor}">${isCorrect ? 'Correct' : 'Incorrect'}</td>
            </tr>
        `;
    });
    tableHtml += `</tbody></table>`;

    if(finalScore > caseStudyData.maximum_score) finalScore = caseStudyData.maximum_score;
    if(finalScore < caseStudyData.minimum_score) finalScore = caseStudyData.minimum_score;
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

    section.innerHTML = `
        <div class="text-center mb-10">
            <h3 class="text-lg font-semibold text-slate-600 uppercase tracking-widest">Your Score</h3>
            <p class="text-6xl font-bold text-[#0b1e36] mt-2">${percentage}%</p>
            <p class="text-sm text-gray-500 mt-1">(${finalScore} / ${caseStudyData.maximum_score} Points)</p>
        </div>

        ${tableHtml}

        <div class="clinical-content border-t border-gray-200 pt-8">
            ${caseStudyData.source.explanation_html}
        </div>

         <div class="clinical-content border-t border-gray-200 pt-8"></div>

        <!-- The WhatsApp Hook CTA -->
<div class="p-6 bg-[#f0fdf4] border-2 border-green-500 rounded-xl text-center shadow-md mb-10">
    <h3 class="text-2xl font-bold text-green-800 mb-2">Want full access to the library?</h3>
    <p class="text-green-700 mb-6">Connect your practise to unlock hundreds of such interactive case studies via ConnectOD.</p>
    
    <div class="flex flex-col items-center">
        <a href="https://wa.me/918068988778?text=Hi,%20I'd%20like%20to%20claim%20my%203-Month%20Free%20Clinical%20Odyssey%20access." target="_blank" class="inline-flex items-center justify-center bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-lg w-full md:w-auto">
            Claim 3-Month FREE Access on WhatsApp
        </a>
        <span class="text-xs sm:text-sm text-green-800 mt-3 font-medium">
            (Can be extended up to 1 year based on your 90-day usage)
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