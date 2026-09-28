document.getElementById('generateBtn').addEventListener('click', generateText);

function generateText() {
    // ── Read account status (Checkboxes) ──────────────────────────────────────────
    const match    = document.getElementById('match').checked;
    const possible = document.getElementById('possible').checked;
    const standard = document.getElementById('standard').checked;
    const googleAcc = document.getElementById('gsr').checked;
    const isPublic = document.getElementById('pub').checked;
    const business = document.getElementById('bs').checked;
    const gofund   = document.getElementById('gfm').checked;
    const mugs     = document.getElementById('mgs').checked;
    const person   = document.getElementById('psg').checked;
    const link     = document.getElementById('textbox').value.trim();

// ── Read all checked feature checkboxes ───────────────────────────────────────
    const features = [];
    const groupNames = [
        'featname', 'featAge', 'featLoc', 'featDob', 'featRel',
        'featSch', 'featJob', 'featMail', 'featLoc1', 'featRel1',
        'featVis', 'featPhoto', 'featLinko'
    ];

    // NEW LOGIC: Grab ALL checked boxes on the page in exact HTML order
    const allCheckedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');

    allCheckedBoxes.forEach(cb => {
        // Only proceed if the checkbox belongs to one of the feature groups above
        if (groupNames.includes(cb.name)) {
            
            // Failsafe: Default to the standard checkbox value
            let finalValue = cb.value ? cb.value.trim() : ""; 

            // ─── THE GLOBAL ALTERNATOR ──────────────────────────────────────────
            // Counts how many times these phrases already exist in the array
            const altCount = features.filter(f => f.includes('as seen on') || f.includes('based on')).length;
            const asSeenOrBased = (altCount % 2 === 0) ? "as seen on" : "based on";
            // ────────────────────────────────────────────────────────────────────

            // --- CHECK NAME STATES BEFORE PROCESSING ---
            const hasF = document.getElementById('fname')?.checked;
            const hasM = document.getElementById('mname')?.checked;
            const hasL = document.getElementById('lname')?.checked;
            
            const noFMods = !document.getElementById('ifname')?.checked && !document.getElementById('afname')?.checked;
            const noMMods = !document.getElementById('imname')?.checked && !document.getElementById('amname')?.checked;
            const noLMods = !document.getElementById('ilname')?.checked && !document.getElementById('alname')?.checked;

            // Hidden section modifier logic
            // Logic for First Name
            if (cb.id === 'fname') {
                const isInitial = document.getElementById('ifname')?.checked;
                const isAlias = document.getElementById('afname')?.checked;
            
                if (isInitial) {
                    finalValue = document.getElementById('ifname').value;
                } else if (isAlias) {
                    finalValue = document.getElementById('afname').value;
                } else {
                    if (hasM && noMMods && hasL && noLMods) {
                        finalValue = "full name";
                    } else if (hasM && noMMods) {
                        finalValue = "first and middle name";
                    } else if (hasL && noLMods && !hasM) {
                        finalValue = "first and last name";
                    }
                }
            } 
            // Logic for Middle Name
            else if (cb.id === 'mname') {
                const isInitial = document.getElementById('imname')?.checked;
                const isAlias = document.getElementById('amname')?.checked;
            
                if (isInitial) {
                    finalValue = document.getElementById('imname').value;
                } else if (isAlias) {
                    finalValue = document.getElementById('amname').value;
                } else {
                    if (hasF && noFMods) {
                        finalValue = null; 
                    } else if (hasL && noLMods) {
                        finalValue = "middle and last name";
                    }
                }
            } 
            // Logic for Last Name
            else if (cb.id === 'lname') {
                const isInitial = document.getElementById('ilname')?.checked;
                const isAlias = document.getElementById('alname')?.checked;
            
                if (isInitial) {
                    finalValue = document.getElementById('ilname').value;
                } else if (isAlias) {
                    finalValue = document.getElementById('alname').value;
                } else {
                    if (hasF && noFMods && hasM && noMMods) {
                        finalValue = null; 
                    } else if (hasF && noFMods && !hasM) {
                        finalValue = null; 
                    } else if (hasM && noMMods && (!hasF || !noFMods)) {
                        finalValue = null; 
                    }
                }
            }
            // Logic for DOB
            else if (cb.id === 'dob1') {
                const doblink = document.getElementById('doblink')?.value.trim() || '';
                const dobtitle = document.getElementById('dobtitle')?.value.trim() || '';
                const dobacc = document.getElementById('dobacc')?.value.trim() || '';
                const isSeen = document.getElementById('seendob')?.checked;
                            
                const baseValue = finalValue; 
                            
                if (isSeen && dobtitle && dobacc) {
                    finalValue = 'combination error';
                } else if (isSeen) {
                    if (dobacc) {
                        if (doblink) {
                            finalValue = `${baseValue} ${asSeenOrBased} <a href="${doblink}" target="_blank">${dobacc}</a>`;
                        } else {
                            finalValue = `${baseValue} ${asSeenOrBased} ${dobacc}`;
                        }
                    } else if (dobtitle && doblink) {
                        finalValue = `${baseValue} ${asSeenOrBased} this <a href="${doblink}" target="_blank">${dobtitle}</a>`;
                    } else if (doblink) {
                        finalValue = `<a href="${doblink}" target="_blank">${baseValue}</a>`;
                    } else {
                        finalValue = baseValue;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Age
            else if (cb.id === 'age1') {
                const isBasedEdu = document.getElementById('basedage')?.checked;
                const isSeenAge = document.getElementById('seenage')?.checked;
                const ageTitle = document.getElementById('agetitle')?.value.trim() || '';
                let baseValue = finalValue;

                if (isBasedEdu) {
                    finalValue = `${baseValue} based on education`;
                } else if (isSeenAge) {
                    if (ageTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} ${ageTitle}`;
                    } else {
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Location
            else if (cb.id === 'location') {
                const loclink = document.getElementById('loclink')?.value.trim() || '';
                const loctitle = document.getElementById('loctitle')?.value.trim() || '';
                const relLink = document.getElementById('locrelnk')?.value.trim() || '';
                const relName = document.getElementById('locrelnm')?.value.trim() || '';
                const isSeen = document.getElementById('seenloc')?.checked;
                const isPrev = document.getElementById('prevloc')?.checked;

                // 1. Check for "Previous" first to establish the base string
                if (isPrev) {
                    finalValue = document.getElementById('prevloc').value; // Sets it to "previous location"
                }

                // 2. Append the relative/client exceptions
                if (document.getElementById('basedrel')?.checked) {
                    // Figure out the name to display (fallback to 'relative')
                    let displayRelName = relName ? relName : "relative";
                    
                    // Wrap in hyperlink if a link is provided
                    if (relLink) {
                        displayRelName = `<a href="${relLink}" target="_blank">${displayRelName}</a>`;
                    }
                    
                    // Append the dynamic string instead of the static checkbox value
                    finalValue += ` based on a relative (${displayRelName})`;
                }

                if (document.getElementById('basedcli')?.checked) {
                    finalValue += ` ${document.getElementById('basedcli').value}`;
                }

                // 3. Append the dynamic "as seen on / based on" link logic
                if (isSeen && loclink && loctitle) {
                    finalValue += ` ${asSeenOrBased} this <a href="${loclink}" target="_blank">${loctitle}</a>`;
                } else if (loclink) {
                    finalValue = `<a href="${loclink}" target="_blank">${finalValue}</a>`;
                }
            }
            // Logic for School
            else if (cb.id === 'school') {
                const schName = document.getElementById('schname')?.value.trim() || '';
                const schLink = document.getElementById('schlink')?.value.trim() || '';
                const schTitle = document.getElementById('schtitle')?.value.trim() || '';
                const isSeen = document.getElementById('seensch')?.checked;

                const displaySchool = schName ? schName : "school";
                let baseValue = `school attended (${displaySchool})`;

                if (isSeen) {
                    if (schLink && schTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} the # identified <a href="${schLink}" target="_blank">${schTitle}</a> account`;
                    } else {
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Phone
            else if (cb.id === 'phone') {
                let phnInput = document.getElementById('phnnmb')?.value.trim() || '';
                const phnNumber = phnInput.replace(/[() ]/g, ''); 
                            
                const phnLink   = document.getElementById('phnlink')?.value.trim() || '';
                const phnTitle  = document.getElementById('phntitle')?.value.trim() || '';
                const isSeen    = document.getElementById('seenphn')?.checked;
                            
                const displayPhone = phnNumber ? `+1-${phnNumber}` : "+1-000-000-000";
                let baseValue = `phone number (${displayPhone})`;
                            
                if (isSeen) {
                    if (phnLink && phnTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} the # identified <a href="${phnLink}" target="_blank">${phnTitle}</a> account`;
                    } else {
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Email
            else if (cb.id === 'email') {
                const mailAddr = document.getElementById('mailad')?.value.trim() || '';
                const mailLink = document.getElementById('mailink')?.value.trim() || '';
                const mailTitle = document.getElementById('maititle')?.value.trim() || '';
                const isUsername = document.getElementById('usrmai')?.checked;
                const isSeen = document.getElementById('seenmai')?.checked;

                const displayEmail = mailAddr ? mailAddr : "email address";
                const usernamePart = mailAddr.split('@')[0] || "username";

                let baseValue = "";
                if (isUsername) {
                    // Note: Included the dynamic phrase inside the base logic as well if username is checked
                    baseValue = `username (${usernamePart}) ${asSeenOrBased} the email address (${displayEmail})`;
                } else {
                    baseValue = `email address (${displayEmail})`;
                }
            
                const effectiveSeen = isSeen || isUsername;
            
                if (effectiveSeen) {
                    if (mailLink && mailTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} the # identified <a href="${mailLink}" target="_blank">${mailTitle}</a> account`;
                    } else {
                        finalValue = `${baseValue}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Nature of Work
            else if (cb.id === 'naturework') {
                const wrkNature = document.getElementById('wrknatr')?.value.trim() || '';
                const wrkLink   = document.getElementById('wrklink')?.value.trim() || '';
                const wrkTitle  = document.getElementById('wrktitle')?.value.trim() || '';
                const isSeen    = document.getElementById('seenwrk')?.checked;
                        
                const displayWork = wrkNature ? wrkNature : "nature of work";
                let baseValue = `nature of work (${displayWork})`;
                        
                if (isSeen) {
                    if (wrkLink && wrkTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} the # identified <a href="${wrkLink}" target="_blank">${wrkTitle}</a> account`;
                    } else {
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // Logic for Employment
            else if (cb.id === 'employment') {
                const empName = document.getElementById('empnm')?.value.trim() || '';
                const empLink = document.getElementById('emplink')?.value.trim() || '';
                const empTitle = document.getElementById('emptitle')?.value.trim() || '';
                const isSeen = document.getElementById('seenemp')?.checked;
            
                // Determine the company name part: either the input value or the placeholder
                const displayEmp = empName ? empName : "company name";
            
                // Set the base starting string
                let baseValue = `employment (${displayEmp})`;
            
                if (isSeen) {
                    if (empLink && empTitle) {
                        // Case: ASO + Link + Account
                        // Result: employment [Name] [as seen on/based on] the # identified [Account] account
                        finalValue = `${baseValue} ${asSeenOrBased} the # identified <a href="${empLink}" target="_blank">${empTitle}</a> account`;
                    } else {
                        // Case: ASO Checked but no link/account info
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    // Case: ASO not checked
                    finalValue = baseValue;
                }
            }
            // Logic for Relative
            else if (cb.id === 'relative') {
                const relName = document.getElementById('relnm')?.value.trim() || '';
                const relLink = document.getElementById('rellink')?.value.trim() || '';
                const relTitle = document.getElementById('reltitle')?.value.trim() || '';
                const isSeen = document.getElementById('seenrel')?.checked;
            
                const displayRel = relName ? relName : "relative name";
                let baseValue = `relative (${displayRel})`;
            
                if (isSeen) {
                    if (relLink && relTitle) {
                        // Removed 'the' for a cleaner: "relative (Name) as seen on [Database Title]"
                        finalValue = `${baseValue} ${asSeenOrBased} <a href="${relLink}" target="_blank">${relTitle}</a>`;
                    } else if (relTitle) {
                        finalValue = `${baseValue} ${asSeenOrBased} ${relTitle}`;
                    } else {
                        finalValue = `${baseValue} ${asSeenOrBased}`;
                    }
                } else {
                    finalValue = baseValue;
                }
            }
            // THE CUSTOM BLOCK
            else if (cb.id === 'custom') {
                const customIds = ['cus1', 'cus2', 'cus3', 'cus4', 'cus5'];
                            
                const customValues = customIds
                    .map(id => document.getElementById(id)?.value.trim() || '')
                    .filter(val => val !== '');
                            
                customValues.forEach(val => {
                    features.push(val);
                });
            
                finalValue = null; 
            }
            // ─── 2 POINTS SECTION LOGIC ──────────────────────────────────────────
            else if (['username', 'linked', 'same', 'visualmatch', 'visualmatch2', 'connections'].includes(cb.id)) {
                
                // Unified to use the exact same global alternator variable!
                const prefix2pt = `${asSeenOrBased} the # identified`;

                if (cb.id === 'visualmatch') { 
                    const link = document.getElementById('vmlink')?.value.trim() || '';
                    const title = document.getElementById('vmtitle')?.value.trim() || '';
                    const isSeen = document.getElementById('seenvm')?.checked;

                    const prefix2pt = `${asSeenOrBased} the # identified`;

                    if (isSeen && link && title) { 
                        // Result: visual match [as seen on/based on] the # identified [Network] account
                        finalValue += ` ${prefix2pt} <a href="${link}" target="_blank">${title}</a> account`;
                    } else {
                        // Fallback if link/title are missing but checkbox is checked
                        finalValue = finalValue; 
                    }
                }
                else if (cb.id === 'username') {
                    const utext = document.getElementById('username_txt')?.value.trim() || '';
                    const link = document.getElementById('userlink')?.value.trim() || '';
                    const title = document.getElementById('usertitle')?.value.trim() || '';
                    if (utext && link && title) {
                        finalValue = finalValue.replace('(username)', `(${utext})`);
                        finalValue += ` ${prefix2pt} <a href="${link}" target="_blank">${title}</a> account`;
                    }
                } 
                else if (cb.id === 'linked') { 
                    const link = document.getElementById('linkedlink')?.value.trim() || '';
                    const title = document.getElementById('linkedtitle')?.value.trim() || '';

                    if (link && title) {
                        // Result: linked to the # identified [Title] account
                        finalValue = `linked to the # identified <a href="${link}" target="_blank">${title}</a> account`;
                    } else if (title) {
                        // Fallback if no link is provided
                        finalValue = `linked to the # identified ${title} account`;
                    } else {
                        // Fallback if both are empty
                        finalValue = `linked to an identified account`;
                    }
                }
                else if (cb.id === 'connections') { 
                    // 1. Grab all the Checkboxes
                    const isMtf = document.getElementById('ismtf')?.checked;
                    const isFo1 = document.getElementById('isfo1')?.checked;
                    const isFo2 = document.getElementById('isfo2')?.checked;
                    const isCon = document.getElementById('iscon')?.checked;
                    const isOwn = document.getElementById('owncon')?.checked;
                    const isSeen = document.getElementById('seencon')?.checked;

                    // 2. Grab all the Text Inputs mapped to your new IDs
                    const conNet = document.getElementById('conet')?.value.trim() || '';
                    const conNetL = document.getElementById('conetl')?.value.trim() || '';
                    const conId = document.getElementById('conid')?.value.trim() || '';
                    const conLink1 = document.getElementById('conlink1')?.value.trim() || '';
                    const conName = document.getElementById('conname')?.value.trim() || '';
                    const conLink2 = document.getElementById('conlink2')?.value.trim() || '';

                    // Mapped based on your HTML placeholders
                    const accUrl = document.getElementById('contitle')?.value.trim() || ''; // Placeholder: Hyperlink
                    const accText = document.getElementById('conlink')?.value.trim() || ''; // Placeholder: # Identified Account

                    // 3. Formatting Helpers (Automatically wraps in hyperlinks if provided)
                    const formatNetwork = (conNet && conNetL) ? `<a href="${conNetL}" target="_blank">${conNet}</a>` : conNet;
                    const formatConId = (conId && conLink1) ? `<a href="${conLink1}" target="_blank">${conId}</a>` : conId;
                    const formatName = (conName && conLink2) ? `<a href="${conLink2}" target="_blank">${conName}</a>` : conName;
                    const formatAcc = (accText && accUrl) ? `<a href="${accUrl}" target="_blank">${accText}</a>` : accText;

                    // SCENARIO 1: "Own" is checked (Overrides ASO entirely)
                    if (isOwn) {
                        let relation = "";
                        if (isMtf) relation = "friends with";
                        else if (isFo1) relation = "following";
                        else if (isFo2) relation = "followed by";
                        else if (isCon) relation = "connected to";
                    
                        if (relation && accText) {
                            finalValue = `${relation} the # identified ${formatAcc} account`;
                        }
                    }
                    // SCENARIO 2: Mutual Friend + ASO + Identified Account
                    else if (isMtf && isSeen) {
                        if (conName && accText) {
                            // Adds parentheses around the name only if a name is typed
                            const displayMtf = formatName ? ` (${formatName})` : "";
                            // Alternator is used here to keep grammar fresh!
                            finalValue = `common friend${displayMtf} ${asSeenOrBased} the # identified ${formatAcc} account`;
                        }
                    }
                    // SCENARIO 3: Following / Follower / Connected
                    else if (isFo1 || isFo2 || isCon) {
                        let relation = "";
                        if (isFo1) relation = "following";
                        else if (isFo2) relation = "followed by";
                        else if (isCon) relation = "connected to";
                    
                        // GRAMMAR CHECKER: Determines whether to use "a" or "an" based on the next word
                        const nextWord = conNet || conId || "";
                        const article = /^[aeiou]/i.test(nextWord) ? "an" : "a";
                    
                        // Build the middle section dynamically (Network + Their Connection)
                        let middlePart = "";
                        if (formatNetwork) middlePart += `${formatNetwork} `;
                        if (formatConId) middlePart += `${formatConId}`;
                        middlePart = middlePart.trim(); // Cleans up extra spaces
                    
                        // Build the name section in parentheses
                        const namePart = formatName ? ` (${formatName})` : "";
                    
                        // Combine it all together (Ignores ASO and Identified Account completely)
                        if (middlePart) {
                            finalValue = `${relation} ${article} ${middlePart}${namePart}`;
                        }
                    }
                }
                else if (cb.id === 'same') { 
                    // 1. Grab values
                    const objLink  = document.getElementById('samelink')?.value.trim() || '';
                    const objName  = document.getElementById('samewhat')?.value.trim() || '';
                    const netLink  = document.getElementById('samelink2')?.value.trim() || '';
                    const netName  = document.getElementById('samewhat2')?.value.trim() || '';

                    // 2. Fallbacks (Prevents silent failures during testing!)
                    const safeObjName = objName ? objName : "[MISSING OBJECT]";
                    const safeNetName = netName ? netName : "[MISSING NETWORK]";

                    // 3. The Alternator
                    const prefix2pt = `${asSeenOrBased} the # identified`;

                    // 4. Formatting
                    const formatWhat = objLink ? `<a href="${objLink}" target="_blank">${safeObjName}</a>` : safeObjName;
                    const formatAcc = netLink ? `<a href="${netLink}" target="_blank">${safeNetName}</a>` : safeNetName;

                    // 5. Build String (No strict 'if' requirement anymore)
                    finalValue = `same ${formatWhat} ${prefix2pt} ${formatAcc} account`;

                    // DEBUGGER: Press F12 in your browser and check the Console tab to see this output!
                    console.log("SAME TRIGGERED! Final String:", finalValue);
                }
                else if (cb.id === 'visualmatch2') { 
                    const link = document.getElementById('loc2link')?.value.trim() || '';
                    const title = document.getElementById('loc2title')?.value.trim() || '';

                    // Exact Location usually implies we are comparing against something,
                    // so we use the alternator prefix here.
                    const prefix2pt = `${asSeenOrBased} the # identified`;

                    if (link && title) { 
                        // Result: exact location [as seen on/based on] the # identified [Network] account
                        finalValue += ` ${prefix2pt} <a href="${link}" target="_blank">${title}</a> account`;
                    } else {
                        // Keeps "exact location" as is if no details are provided
                        finalValue = finalValue; 
                    }
                }
            }

            // Push the final computed string to the array
            if (finalValue) {
                features.push(finalValue);
            }
        }
    });

// ── END OF CHECKBOX PROCESSING ── (Move on to generating the paragraph below)

let accountType = '';
let prefix = 'Identified Account';

if (business) {
    accountType = 'Business Page';
    prefix = 'Identified Business Page';
} else if (googleAcc) { // <--- GOOGLE LOGIC ADDED HERE
    accountType = 'Google';
    prefix = ''; 
} else if (isPublic) {
    accountType = 'on (a) public socmed post/s/photo/s/video/s. No personal match found.';
    prefix = 'Identified on (a) public post/s/photo/s/video/s. No personal match found.';
} else if (gofund) {
    accountType = 'GoFundMe Page';
    prefix = 'Identified GoFundMe Page';
} else if (mugs) {
    accountType = 'Mugshot';
    prefix = 'Identified Mugshot';
} else if (person) {
    accountType = 'Personal Page';
    prefix = 'Identified Personal Page';
} else if (standard) {
    accountType = 'Account';
    prefix = 'Identified Account';
}

// ── Handle "Possible" logic ──────────────────────────────────────────────────
// Added 'Google' to allowed possible categories
const possibleCategories = ['Account', 'Personal Page', 'GoFundMe Page', 'Mugshot', 'Google'];
const canBePossible = possibleCategories.includes(accountType);

const isPossible = possible && canBePossible && !business && !isPublic;

// Override prefix when it's a "possible" match
if (isPossible) {
    if (match) {
        prefix = `(Please select Match or Possible only)`;
    } else {
        prefix = `Possible ${accountType}`;
    }
} else if (match && accountType) {
    prefix = `Identified ${accountType}`;
}

// Fallback when nothing matched
if (!accountType) {
    prefix = '(no account type selected)';
}

//

// Enhance features with "as seen on" or relative qualifiers when appropriate
const enhancedFeatures = features.map(f => {
    if (f.includes('date of birth') || f === 'age') {
        const dobSection = document.getElementById('dobsection');
        const ageSection = document.getElementById('agesection');
        
        if (dobSection?.classList.contains('active') && document.getElementById('seendob')?.checked) {
            return `${f} as seen on`;
        }
        if (ageSection?.classList.contains('active') && document.getElementById('seenage')?.checked) {
            return `${f} as seen on`;
        }
    }
    
    if (f.includes('relative') || f.includes('based on a relative')) {
        const locSection = document.getElementById('locsection');
        if (locSection?.classList.contains('active') && document.getElementById('basedrel')?.checked) {
            return 'relative (based on a relative)';
        }
    }
    
    return f;
});

// Use enhancedFeatures instead of features from now on
const finalFeatures = enhancedFeatures.filter(Boolean); // remove any empty

//

// ── Build features string (Grammar Logic) ─────────────────────────────────────
let featuresStr = 'none';
if (features.length === 1) {
    featuresStr = features[0];
} else if (features.length === 2) {
    featuresStr = features.join(' and ');
} else if (features.length > 2) {
    const last = features.pop();
    featuresStr = features.join(', ') + ', and ' + last;
}

// ── Build final result ────────────────────────────────────────────────────────
let result = '';

if (googleAcc) {
    // If Google is checked, skip the link and prefix line entirely. No blank space.
} else if (isPublic) {
    // Special clean format for public pages — no <strong>, no colon
    result += `<p>${prefix}${link ? ` ${link}` : ''}</p>\n`;
    result += '<p>&nbsp;</p>\n'; 
} else {
    // Normal format with bold prefix + colon
    result += `<p><strong>${prefix}:</strong>${link ? ` ${link}` : ''}</p>\n`;
    result += '<p>&nbsp;</p>\n';
}

if (features.length > 0 || match || possible) {
    let matchPhrase = '';
    if (match) {
        matchPhrase = 'Match';
    } else if (isPossible) {
        matchPhrase = 'Possible match';
    }

    if (matchPhrase) {
        result += `<p>${matchPhrase} found by ${featuresStr}.</p>\n`;
    }
}

    document.getElementById('builder').innerHTML = result;
}

document.getElementById("clearBtn").onclick = function() {
    const clearBtn = document.getElementById("clearBtn");
    const originalText = clearBtn.textContent;

    // 1. Reset ALL checkboxes on the page
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        el.checked = false;
        el.disabled = false;
    });

    // 2. Clear all text input fields inside #hidden1
    document.querySelectorAll('#hidden1 input[type="text"]').forEach(el => {
        el.value = "";
    });

    // 3. Wake up EVERYTHING (Removes dimmed class)
    document.querySelectorAll('.dimmed-input').forEach(el => {
        el.classList.remove('dimmed-input');
    });

    // 4. Hide hidden section and subgroups
    const hiddenSection = document.getElementById('hidden1');
    if (hiddenSection) {
        hiddenSection.style.display = 'none';
        document.querySelectorAll('#hidden1 .subgroup').forEach(div => {
            div.classList.remove('active');
        });
    }

    // 5. Reset main link and output area
    const textbox = document.getElementById("textbox");
    if (textbox) textbox.value = "";

    const builder = document.getElementById("builder");
    if (builder) {
        builder.innerHTML = '<p>Please input data.</p><p>&nbsp;</p><p>Please input data.</p>';
    }

    // --- VISUAL FEEDBACK ---
    clearBtn.textContent = 'Cleared!';
    setTimeout(() => {
        clearBtn.textContent = originalText;
    }, 1200); // Shorter duration for clearing is usually better
};

// ─── DYNAMIC UI FOR CONNECTIONS SECTION ─────────────────────────────
function updateConnectionUI() {
    // 1. Grab Checkbox Elements (We need the actual elements to disable them)
    const cbMtf = document.getElementById('ismtf');
    const cbFo1 = document.getElementById('isfo1');
    const cbFo2 = document.getElementById('isfo2');
    const cbCon = document.getElementById('iscon');
    const cbOwn = document.getElementById('owncon');
    const cbSeen = document.getElementById('seencon');

    // Grab their current checked states
    const isMtf = cbMtf?.checked;
    const isFo1 = cbFo1?.checked;
    const isFo2 = cbFo2?.checked;
    const isCon = cbCon?.checked;
    const isOwn = cbOwn?.checked;
    const isSeen = cbSeen?.checked;

    // 2. Group the text inputs by their purpose
    const grpTheirConn = [document.getElementById('conid'), document.getElementById('conlink1')];
    const grpConnName  = [document.getElementById('conname'), document.getElementById('conlink2')];
    const grpNetwork   = [document.getElementById('conet'), document.getElementById('conetl')];
    const grpIdAccount = [document.getElementById('contitle'), document.getElementById('conlink')];

    // Helper: Safely dims/undims Text Boxes
    const setDimmed = (group, isDimmed) => {
        group.forEach(el => {
            if (el) {
                if (isDimmed) el.classList.add('dimmed-input');
                else el.classList.remove('dimmed-input');
            }
        });
    };

    // Helper: Safely dims/undims Checkboxes AND their Labels
    const setCbDimmed = (cb, isDimmed) => {
        if (!cb) return;
        cb.disabled = isDimmed; // Disables clicking
        const label = document.querySelector(`label[for="${cb.id}"]`);
        if (label) {
            if (isDimmed) label.classList.add('dimmed-input');
            else label.classList.remove('dimmed-input');
        }
    };

    // 3. Reset EVERYTHING to visible & enabled first
    setDimmed([...grpTheirConn, ...grpConnName, ...grpNetwork, ...grpIdAccount], false);
    [cbMtf, cbFo1, cbFo2, cbCon, cbOwn, cbSeen].forEach(cb => setCbDimmed(cb, false));

    // 4. CHECKBOX EXCLUSIVITY: Primary Relationships
    if (isMtf) {
        setCbDimmed(cbFo1, true); setCbDimmed(cbFo2, true); setCbDimmed(cbCon, true);
    } else if (isFo1) {
        setCbDimmed(cbMtf, true); setCbDimmed(cbFo2, true); setCbDimmed(cbCon, true);
    } else if (isFo2) {
        setCbDimmed(cbMtf, true); setCbDimmed(cbFo1, true); setCbDimmed(cbCon, true);
    } else if (isCon) {
        setCbDimmed(cbMtf, true); setCbDimmed(cbFo1, true); setCbDimmed(cbFo2, true);
    }

    // 5. CHECKBOX EXCLUSIVITY: Modifiers
    if (isMtf) {
        // If "Friend" is checked: ASO and Own conflict with each other
        if (isSeen) setCbDimmed(cbOwn, true);
        if (isOwn) setCbDimmed(cbSeen, true);
    } else if (isFo1 || isFo2 || isCon) {
        // If Following/Follower/Connected is checked: ASO is completely irrelevant
        setCbDimmed(cbSeen, true);
    }

    // 6. TEXT BOX SCENARIOS
    if (isOwn) {
        // SCENARIO 1: Own is checked -> Dims everything except Identified Account
        setDimmed([...grpTheirConn, ...grpConnName, ...grpNetwork], true);
    } 
    else if (isMtf) {
        // SCENARIO 2: Mutual Friend -> Dims Their Conn & Network
        setDimmed([...grpTheirConn, ...grpNetwork], true);
    } 
    else if (isFo1 || isFo2 || isCon) {
        // SCENARIO 3: Following / Follower / Connected -> Dims Identified Account
        setDimmed(grpIdAccount, true);
    }
}

// Attach the listener to all checkboxes inside the connections section
document.querySelectorAll('#connsection input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateConnectionUI);
});
// Run once on load to set the initial state
updateConnectionUI();

const copyBtn = document.getElementById('copyBuilderBtn');
const feedback = document.getElementById('copyFeedback');

copyBtn.addEventListener('click', async () => {
    const builder = document.getElementById('builder');
    // Save what the button originally says (e.g. "Copy Content")
    const originalText = copyBtn.textContent; 

    // Early exit if empty
    if (builder.innerHTML.trim() === '' || builder.textContent.trim() === 'Please input data.') {
        copyBtn.textContent = 'Nothing to copy';
        setTimeout(() => copyBtn.textContent = originalText, 1600);
        return;
    }

    // ─── Prepare rich content ──────────────────────────────────────
    const html = builder.innerHTML
        // Optional: fix common inline spacing issues
        .replace(/<p>\s*<\/p>/g, '<p><br></p>');

    const plain = builder.innerText
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // Helper function to animate the button text on success
    const showSuccess = (msg = 'Copied!') => {
        copyBtn.textContent = msg;
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2200);
    };

    try {
        // 1. Try Modern rich clipboard API (Best for Chrome)
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobPlain = new Blob([plain], { type: 'text/plain' });

        const data = [
            new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobPlain
            })
        ];

        await navigator.clipboard.write(data);
        showSuccess('Copied!'); 

    } catch (err) {
        // 2. Middle Fallback: DOM Selection (Bulletproof for Firefox/Safari hyperlinks)
        try {
            const range = document.createRange();
            range.selectNodeContents(builder);
            
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            const successful = document.execCommand('copy');
            selection.removeAllRanges(); // Unselect text after copying

            if (successful) {
                showSuccess('Copied!'); 
            } else {
                throw new Error('execCommand failed');
            }
        } catch (fallbackErr) {
            // 3. Final Fallback: try plain text only if everything else completely fails
            try {
                await navigator.clipboard.writeText(plain);
                showSuccess('COPIED (Plain Text)'); // Slightly different message for plain text
            } catch (finalErr) {
                copyBtn.textContent = 'FAILED';
                console.error('Clipboard write failed:', err, fallbackErr, finalErr);
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2500);
            }
        }
    }
});

addEventListener('scroll', () => document.querySelector('.scroll-to-top').classList.toggle('show', scrollY > 200));

document.addEventListener('DOMContentLoaded', () => {
    // Map checkbox IDs → which subgroup to show
    const mapping = {
        'alias':      'aliassection',
        'fname':      'firstnamesection',
        'mname':      'middlenamesection',
        'lname':      'lastnamesection',
        'dob1':       'dobsection',
        'age1':       'agesection',
        'location':   'locsection',
        'school':     'schsection',
        'phone':      'phnsection',
        'email':      'maisection',
        'naturework': 'wrksection',
        'employment': 'empsection',
        'relative':   'relsection',
        
        // 2 POINTS Section Mappings
        'username':   'usersection',
        'linked':     'linksection',
        'same':       'samesection',
        'visualmatch':'vmsection',
        'visualmatch2':'loc2section',
        'connections':'connsection',
        'custom':'cussection'
    };

    // Find the main checkboxes (the ones outside #hidden1)
    Object.keys(mapping).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (!checkbox) return;

        checkbox.addEventListener('change', () => {
            const targetId = mapping[checkboxId];
            const targetDiv = document.getElementById(targetId);
            if (!targetDiv) return;

            if (checkbox.checked) {
                targetDiv.classList.add('active');
            } else {
                targetDiv.classList.remove('active');
            }

            // Show/hide the whole container depending if ANY subgroup is visible
            updateContainerVisibility();
        });
    });

    // Helper: show #hidden1 only if at least one subgroup is active
    function updateContainerVisibility() {
        const container = document.getElementById('hidden1');
        const anyVisible = Array.from(container.querySelectorAll('.subgroup'))
            .some(div => div.classList.contains('active'));

        container.style.display = anyVisible ? 'flex' : 'none';
    }

    // Optional: run once at start (in case any are pre-checked)
    updateContainerVisibility();
});

function setupExclusiveCheckboxes(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const checkboxes = section.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                // If this one is checked, disable all others in this group
                checkboxes.forEach(other => {
                    if (other !== cb) {
                        other.disabled = true;
                    }
                });
            } else {
                // If this one is unchecked, re-enable all in this group
                checkboxes.forEach(other => {
                    other.disabled = false;
                });
            }
        });
    });
}

// Apply the logic to your two specific sections
setupExclusiveCheckboxes('matchtype');

setupExclusiveCheckboxes('accounttype');




