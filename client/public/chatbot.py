import json
from js import document, console
from pyodide.ffi import create_proxy

# Structured knowledge base for Sri Lankan gems
KNOWLEDGE_BASE = {
    "sri_lanka": {
        "response": "Sri Lanka, historically known as Ceylon, is dubbed 'Ratna-Dweepa' (Gem Island) for its rich gem deposits. It has been a global gem source for over 2,500 years, renowned for blue sapphires, rubies, and padparadscha sapphires.",
        "keywords": ["sri lanka", "ceylon", "gem island", "ratna-dweepa"],
        "category": "history"
    },
    "blue_sapphire": {
        "response": "Ceylon Blue Sapphires are prized for their vivid cornflower blue hue, exceptional clarity, and brilliance. Notable examples include the Star of India (563 carats) and the sapphire in Princess Diana’s engagement ring (now Kate Middleton’s).",
        "keywords": ["blue sapphire", "ceylon sapphire", "star of india", "cornflower blue"],
        "category": "gem_types"
    },
    "padparadscha": {
        "response": "Padparadscha sapphires, unique to Sri Lanka, exhibit a rare pink-orange hue resembling a lotus blossom. They are among the most expensive sapphires, often exceeding $10,000 per carat for top-quality stones.",
        "keywords": ["padparadscha", "pink-orange sapphire", "lotus sapphire"],
        "category": "gem_types"
    },
    "mining": {
        "response": "Traditional Sri Lankan gem mining, known as 'illama,' involves hand-dug pits to reach gem-rich gravel. Modern mining is regulated to minimize environmental impact, with mandatory land rehabilitation.",
        "keywords": ["mining", "illama", "gem mining", "sustainable mining"],
        "category": "mining"
    },
    "ratnapura": {
        "response": "Ratnapura, the 'City of Gems,' is Sri Lanka’s gem trade hub in Sabaragamuwa Province. Its unique geology yields diverse gemstones, making it a focal point for miners and traders.",
        "keywords": ["ratnapura", "city of gems", "gem trade"],
        "category": "location"
    },
    "certification": {
        "response": "All gems are certified by the National Gem and Jewellery Authority (NGJA) or GIA, ensuring authenticity, origin, and quality. Certificates detail the 4Cs: Cut, Color, Clarity, and Carat weight.",
        "keywords": ["certification", "authenticity", "ngja", "gia"],
        "category": "buying_selling"
    },
    "ethical_sourcing": {
        "response": "Sri Lanka’s gem mining is among the most sustainable globally, using small-scale, family-run operations and strict environmental regulations. Gems are ethically sourced, supporting local communities.",
        "keywords": ["ethical sourcing", "sustainability", "environment", "ethical gems"],
        "category": "ethics"
    },
    "pricing": {
        "response": "Gem prices depend on the 4Cs (Cut, Color, Clarity, Carat). Blue and padparadscha sapphires are priciest, with top stones fetching $5,000-$20,000 per carat. Real-time pricing can be checked via our platform.",
        "keywords": ["pricing", "cost", "4cs", "gem prices"],
        "category": "buying_selling"
    }
}

# Simulated API for real-time gem data
def fetch_gem_data(query):
    console.log(f"fetch_gem_data: Processing query: {query}")
    mock_data = {
        "blue sapphire": {
            "details": "Current market price for high-quality Ceylon Blue Sapphires: $500-$5,000 per carat.",
            "source": "National Gem and Jewellery Authority (NGJA)"
        },
        "padparadscha": {
            "details": "Current market price for top-quality Padparadscha Sapphires: $10,000-$20,000 per carat.",
            "source": "NGJA"
        },
        "ruby": {
            "details": "Current market price for Sri Lankan Rubies: $300-$3,000 per carat.",
            "source": "NGJA"
        }
    }
    return mock_data.get(query.lower(), {"details": "No real-time data available.", "source": "N/A"})

# Find best match in knowledge base (keyword-based)
def find_best_match(query):
    console.log(f"find_best_match: Processing query: {query}")
    best_match = None
    best_score = -1
    matched_keywords = []

    query_lower = query.lower()
    for key, entry in KNOWLEDGE_BASE.items():
        matched = [kw for kw in entry["keywords"] if kw in query_lower]
        score = len(matched) / max(len(entry["keywords"]), 1)
        console.log(f"find_best_match: Key: {key}, Matched: {matched}, Score: {score}")
        if score > best_score:
            best_score = score
            best_match = entry
            matched_keywords = matched

    console.log(f"find_best_match: Best score: {best_score}, Match: {best_match['response'] if best_match else 'None'}, Matched keywords: {matched_keywords}")
    return best_match, best_score

# Generate response with context awareness
def generate_response(query, context):
    console.log(f"generate_response: Processing query: {query}, Context: {context}")
    query = query.strip().lower()
    if not query:
        console.log("generate_response: Empty query")
        return "Please enter a valid question about Sri Lankan gems."

    # Check real-time API data
    api_data = fetch_gem_data(query)
    if api_data["details"] != "No real-time data available.":
        console.log(f"generate_response: Using API data: {api_data['details']}")
        return f"{api_data['details']} (Source: {api_data['source']})"

    # Find best match in knowledge base
    best_match, score = find_best_match(query)
    if best_match and score > 0.2:
        # Contextual follow-up handling
        if context and "more" in query:
            last_topic = context[-1].lower() if context else ""
            if "sapphire" in last_topic:
                console.log("generate_response: Contextual response for sapphires")
                return "Would you like details on sapphire mining, famous sapphires, or their investment potential?"
            elif "mining" in last_topic:
                console.log("generate_response: Contextual response for mining")
                return "Sri Lankan mining is eco-friendly. Want to know about Ratnapura’s role or specific mining techniques?"
        console.log(f"generate_response: Using knowledge base: {best_match['response']}")
        return best_match["response"]

    # Handle specific queries
    if "sapphire" in query and "color" in query:
        console.log("generate_response: Specific response for sapphire colors")
        return "Sri Lankan sapphires come in various colors: cornflower blue (most famous), yellow, pink, purple, green, and colorless. Padparadscha sapphires, with a pink-orange hue, are exceptionally rare."
    elif "best time" in query and "buy" in query:
        console.log("generate_response: Specific response for buying time")
        return "The best times to buy are during Colombo or Ratnapura gem shows (August and January). Our platform offers certified gems year-round with transparent pricing."
    elif "invest" in query or "investment" in query:
        console.log("generate_response: Specific response for investment")
        return "High-quality Sri Lankan gems like blue sapphires and padparadscha sapphires are strong investments due to rarity and demand. Always buy certified stones from trusted sources."
    elif "fake" in query or "synthetic" in query:
        console.log("generate_response: Specific response for fakes")
        return "Avoid fakes by purchasing certified gems (NGJA/GIA). Natural gems have inclusions, unlike synthetics. Our platform guarantees authenticity with full certification."
    elif "care" in query or "clean" in query:
        console.log("generate_response: Specific response for gem care")
        return "Clean gems with mild soap and warm water. Avoid ultrasonic cleaners for softer gems like emeralds. Sapphires and rubies (Mohs 9) are durable but store separately to prevent scratches."

    # Default response
    console.log("generate_response: Default response")
    return "I’m not sure I understood. Try asking about Sri Lankan gems, their history, types (e.g., blue sapphires, padparadscha), mining, or buying/selling. Use the suggested questions for ideas!"

# Main chatbot loop
conversation_context = []

def process_message(user_input):
    global conversation_context
    console.log(f"process_message: Received input: {user_input}")
    
    try:
        # Update context (keep last 5 messages)
        conversation_context = (conversation_context + [user_input])[-5:]
        
        # Generate response
        response = generate_response(user_input, conversation_context)
        console.log(f"process_message: Generated response: {response}")
        return response
    except Exception as e:
        console.log(f"process_message: Error: {str(e)}")
        raise Exception(f"Error processing message: {str(e)}")

# Pyodide-compatible main loop
def main():
    console.log("main: Initializing chatbot")
    try:
        document.process_message = create_proxy(process_message)
        console.log("main: process_message exposed to document successfully")
    except Exception as e:
        console.log(f"main: Error exposing process_message: {str(e)}")
        raise

# Run main in Pyodide environment
main()