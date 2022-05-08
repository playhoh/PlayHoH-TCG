// https://github.com/ranbuch/walkthrough-js/blob/master/src/textToSpeech.ts
export function hasSpeechApi() {
    return 'SpeechSynthesisUtterance' in window
}

export function say(text: string, options = {}, cont = undefined) {
    if (!hasSpeechApi())
        return

    let msg = new SpeechSynthesisUtterance();

    // msg.voice = this.voice;
    // msg['voiceURI'] = this.voiceURI;

    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 1; // 0 to 2
    msg.text = text?.replace(/[^A-Za-z0-9,\.!?]/g, ""); // don't read out emojis
    msg.lang = 'en-US';

    msg.onend = () => {
        cont && cont()
    };

    speechSynthesis.speak(msg)

    return {cancel: () => speechSynthesis.cancel()}
}
