document.addEventListener('DOMContentLoaded', () => {
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const receiptInput = document.getElementById('receiptInput');
    const outputSection = document.getElementById('outputSection');
    const checklistContainer = document.getElementById('checklistContainer');
    const progressText = document.getElementById('progressText');
    const progressBarFill = document.getElementById('progressBarFill');

    let checklistState = [];

    const sampleReceipt = `
=================================
       ACME CORP TECH SUPPLY
    123 Startup Blvd, Suite 400
       San Francisco, CA 94107
=================================

Date: 2026-09-27
Invoice #: INV-2026-8842
Payment Terms: Net 30
Due Date: 2026-10-27

BILL TO:
Recieptify HQ

ITEMS:
1x MacBook Pro 16"        $ 2,499.00
2x Dell 27" 4K Monitor    $   798.00
1x Ergonomic Chair        $   350.00

---------------------------------
Subtotal:                 $ 3,647.00
Sales Tax (8.5%):         $   310.00
Discount (PROMO):         $  -100.00
---------------------------------
TOTAL DUE:                $ 3,857.00

Payment Method: Credit Card ending in 4242
Status: PAID
=================================
Thank you for your business!
`;

    loadSampleBtn.addEventListener('click', () => {
        receiptInput.value = sampleReceipt.trim();
    });

    generateBtn.addEventListener('click', () => {
        const text = receiptInput.value.trim();
        if (!text) {
            alert('Please paste some receipt or invoice text first.');
            return;
        }

        parseTextAndGenerateChecklist(text);
        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth' });
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = formatChecklistForCopy();
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = 'Copied!';
            setTimeout(() => {
                copyBtn.innerText = originalText;
            }, 2000);
        });
    });

    function parseTextAndGenerateChecklist(text) {
        // Very basic mock parser using regex for demonstration
        const extract = (regex) => {
            const match = text.match(regex);
            return match ? match[1].trim() : 'Not Found';
        };

        const parsedData = {
            header: {
                vendor: text.split('\n')[1] || 'Not Found', // Assuming second line is vendor
                date: extract(/Date:\s*(.*)/i),
                invoiceNumber: extract(/Invoice\s*#:\s*(.*)/i)
            },
            financials: {
                subtotal: extract(/Subtotal:\s*([$\d,.]+)/i),
                tax: extract(/(?:Tax|Sales Tax)[^:]*:\s*([$\d,.]+)/i),
                discount: extract(/Discount[^:]*:\s*([$\d,.-]+)/i),
                total: extract(/TOTAL(?: DUE)?:\s*([$\d,.]+)/i)
            },
            payment: {
                method: extract(/Payment Method:\s*(.*)/i),
                dueDate: extract(/Due Date:\s*(.*)/i),
                status: extract(/Status:\s*(.*)/i)
            }
        };

        buildChecklistUI(parsedData);
    }

    function buildChecklistUI(data) {
        checklistContainer.innerHTML = '';
        checklistState = [];

        const categories = [
            {
                title: 'Header & Vendor Details',
                items: [
                    { label: 'Vendor Name', value: data.header.vendor },
                    { label: 'Invoice/Receipt Date', value: data.header.date },
                    { label: 'Invoice Number', value: data.header.invoiceNumber }
                ]
            },
            {
                title: 'Financial Summary',
                items: [
                    { label: 'Subtotal Matches', value: data.financials.subtotal },
                    { label: 'Tax Calculation Correct', value: data.financials.tax },
                    { label: 'Discounts Applied', value: data.financials.discount },
                    { label: 'Total Amount Verified', value: data.financials.total }
                ]
            },
            {
                title: 'Payment Status & Terms',
                items: [
                    { label: 'Payment Method', value: data.payment.method },
                    { label: 'Due Date', value: data.payment.dueDate },
                    { label: 'Payment Status', value: data.payment.status }
                ]
            },
            {
                title: 'General Verification Checks',
                items: [
                    { label: 'Confirm vendor is authorized', value: 'Manual Check' },
                    { label: 'Check for duplicate entry', value: 'Manual Check' },
                    { label: 'Receipt is legible/authentic', value: 'Manual Check' }
                ]
            }
        ];

        categories.forEach((cat, catIndex) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'category-group';
            
            const title = document.createElement('h3');
            title.innerText = cat.title;
            groupDiv.appendChild(title);

            cat.items.forEach((item, itemIndex) => {
                const globalIndex = checklistState.length;
                checklistState.push({ ...item, checked: false, category: cat.title });

                const itemDiv = document.createElement('div');
                itemDiv.className = 'checklist-item';
                itemDiv.dataset.index = globalIndex;
                
                const checkbox = document.createElement('div');
                checkbox.className = 'checkbox-custom';
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'item-content';
                
                const label = document.createElement('span');
                label.className = 'item-label';
                label.innerText = item.label;
                
                const value = document.createElement('span');
                value.className = 'item-value';
                value.innerText = item.value;

                contentDiv.appendChild(label);
                contentDiv.appendChild(value);
                
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(contentDiv);

                itemDiv.addEventListener('click', () => {
                    itemDiv.classList.toggle('checked');
                    checklistState[globalIndex].checked = !checklistState[globalIndex].checked;
                    updateProgress();
                });

                groupDiv.appendChild(itemDiv);
            });

            checklistContainer.appendChild(groupDiv);
        });

        updateProgress();
    }

    function updateProgress() {
        const total = checklistState.length;
        const checked = checklistState.filter(item => item.checked).length;
        const percentage = total === 0 ? 0 : (checked / total) * 100;
        
        progressText.innerText = `${checked}/${total} Verified`;
        progressBarFill.style.width = `${percentage}%`;
    }

    function formatChecklistForCopy() {
        let text = 'RECIEPTIFY AUDIT SUMMARY\n==========================\n\n';
        
        let currentCat = '';
        checklistState.forEach(item => {
            if (item.category !== currentCat) {
                text += `\n[ ${item.category.toUpperCase()} ]\n`;
                currentCat = item.category;
            }
            const checkMark = item.checked ? '[X]' : '[ ]';
            text += `${checkMark} ${item.label}: ${item.value}\n`;
        });

        const total = checklistState.length;
        const checked = checklistState.filter(item => item.checked).length;
        text += `\n==========================\nStatus: ${checked}/${total} Verified\n`;
        
        return text;
    }
});
