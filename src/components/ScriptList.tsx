import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCRIPTS } from '../scripts/registry';
import { AI_BRAINSTORMING_PROMPT } from '../scripts/aiPrompt';

export function ScriptList() {
    const [search, setSearch] = useState('');
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const filtered = useMemo(() => {
        return SCRIPTS.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.id.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(AI_BRAINSTORMING_PROMPT).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="script-list-container">
            <div className="header-actions">
                <h1>Available Scripts</h1>
                <button onClick={handleCopyPrompt} className="copy-btn">
                    {copied ? 'Copied to Clipboard!' : 'Copy AI Brainstorming Prompt'}
                </button>
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
                1. Make sure to run `npm install` again to pick up `react-router-dom`.
                2. Run `npm run dev`.
                3. Go to `http://localhost:5173/`. You will see the "Copy AI Brainstorming Prompt" button.
                4. Click the button. The text will change to "Copied to Clipboard!" for 2 seconds.
                5. Open a text editor and paste (Ctrl+V/Cmd+V). Verify the complete instruction prompt is pasted.
            */}
            {/* ENDINFO */}
        </div>
    );
}