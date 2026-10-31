import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCRIPTS } from '../scripts/registry';
import { AI_BRAINSTORMING_PROMPT, AI_CODE_GENERATION_PROMPT } from '../scripts/aiPrompt';

export function ScriptList() {
    const [search, setSearch] = useState('');
    const [copiedBrainstorm, setCopiedBrainstorm] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const navigate = useNavigate();

    const filtered = useMemo(() => {
        return SCRIPTS.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.id.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleCopy = (text: string, setStatus: (val: boolean) => void) => {
        navigator.clipboard.writeText(text).then(() => {
            setStatus(true);
            setTimeout(() => setStatus(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="script-list-container">
            <div className="header-actions">
                <h1>Available Scripts</h1>
                <div className="prompt-buttons">
                    <button 
                        onClick={() => handleCopy(AI_BRAINSTORMING_PROMPT, setCopiedBrainstorm)} 
                        className="copy-btn"
                    >
                        {copiedBrainstorm ? 'Copied!' : 'Copy Script Prompt'}
                    </button>
                    <button 
                        onClick={() => handleCopy(AI_CODE_GENERATION_PROMPT, setCopiedCode)} 
                        className="copy-btn"
                    >
                        {copiedCode ? 'Copied!' : 'Copy Code Prompt'}
                    </button>
                </div>
            </div>
            <input 
                type="text" 
                className="search-bar" 
                placeholder="Search scripts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="scripts-grid">
                {filtered.map(script => (
                    <div key={script.id} className="script-card" onClick={() => navigate(`/studio/${script.id}`)}>
                        <h3>{script.name}</h3>
                        <p>{script.scenes.length} scene{script.scenes.length !== 1 ? 's' : ''}</p>
                    </div>
                ))}
                {filtered.length === 0 && <p className="no-results">No scripts found.</p>}
            </div>
            
            {/* INFO User testing guidance */}
            {/* 
                End-user Manual Test instructions:
                1. Go to `http://localhost:5173/`. You will see two buttons now.
                2. Test copying the "Copy Code Prompt" and verify the text in a text editor.
                3. You can now physically delete `src/scripts/content/dummy.ts` from your OS/IDE.
                4. The script list will automatically refresh, and "Dummy Testing Script" will disappear instantly without causing any IDE red marks or React crashes!
                5. Restore or create a new file in `src/scripts/content/` mirroring the structure, and it will immediately appear in the UI.
            */}
            {/* ENDINFO */}
        </div>
    );
}