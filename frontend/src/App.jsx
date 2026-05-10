import { useState } from 'react';
function App(){
    const [url, setUrl] = useState("");

    return(
        <div>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste long URL"
            />
            <button onClick={() => console.log(url)}>
                    Convert
                  </button>

        </div>
    );
}

export default App;