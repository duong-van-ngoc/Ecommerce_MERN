const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDarCNwoQVUwJ6Q6UhlNC-9EWg48_d5TSg";

async function testAll() {
    try {
        console.log("Fetching models...");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data.error) {
            console.error("Error fetching models:", data.error.message);
            return;
        }

        const validModels = data.models.filter(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        console.log(`Found ${validModels.length} models supporting generateContent. Testing...`);

        for (const model of validModels) {
            console.log(`\nTesting ${model.name}...`);
            const body = {
                contents: [{ parts: [{ text: "say hello" }] }]
            };
            try {
                const start = Date.now();
                const genRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const ms = Date.now() - start;
                
                if (genRes.ok) {
                    const genData = await genRes.json();
                    console.log(`✅ SUCCESS (${ms}ms) ->`, genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().substring(0, 50));
                } else {
                    const errData = await genRes.json();
                    console.log(`❌ FAILED (${genRes.status}) ->`, errData.error?.message?.substring(0, 100));
                }
            } catch (err) {
                console.log(`❌ NETWORK ERROR:`, err.message);
            }
            // Sleep 1s to respect rate limits between requests
            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (err) {
        console.error("Fatal error:", err);
    }
}

testAll();
