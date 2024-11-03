function getLanguageName(languageCode) {
    const popularLanguages = new Map([
        ["en", "English"],
        ["sv", "Swedish"],
        ["se", "Northern Sami"],
        ["fi", "Finnish"],
        ["es", "Spanish"],
        ["zh", "Chinese"],
        ["fr", "French"],
        ["de", "German"],
        ["ja", "Japanese"],
        ["ru", "Russian"],
        ["pt", "Portuguese"],
        ["ar", "Arabic"],
        ["it", "Italian"],
    ]);

    return popularLanguages.get(languageCode) || languageCode;
}

export {getLanguageName};