const fs = require('fs');
const path = 'frontend/components/CreateLead.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>`;

const replacement = `                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>`;

let updated = content.replace(/\r\n/g, '\n').replace(target, replacement);
fs.writeFileSync(path, updated, 'utf8');
console.log('Fixed closing map in CreateLead!');
