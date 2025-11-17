export const describeResult = (item) => {
    const { word, phonetic, translation, explains, web = [], wfs = [] } = item;
    const symbol = phonetic ? ` [${phonetic}]` : '';
    let webStr, wfsStr, descStr = '';
    if (explains && explains.length > 0) {
        descStr += '\n';
        descStr += explains.join('\n');
    }
    if (translation && translation.length > 0) {
        descStr += ': ';
        descStr += translation.join('\n');
    }
    if (web && web.length > 0) {
        webStr =
            '\n' +
                Array.from(web, (o) => `[网译] ${o.key} ${o.value.join(';')}`).join('\n');
    }
    if (wfs && wfs.length > 0) {
        wfsStr =
            '\n' +
                Array.from(wfs, (o) => `[${o.name}] ${o.value}`).join('\n');
    }
    return `${word || ''}${symbol || ''}${descStr || ''}${webStr || ''}${wfsStr || ''}`;
};
export const format = (res) => {
    const { translation = [], basic = {}, query = '', web = [] } = res;
    const { explains = [], wfs = [] } = basic;
    const item = {
        explains: explains,
        phonetic: basic['us-phonetic'] || basic['uk-phonetic'] || basic['phonetic'] || '',
        translation: translation,
        word: query,
        web: web,
        updated: Date.now(),
        wfs: Array.from(wfs, (o) => o.wf),
        count: 1,
    };
    return item;
};
export const truncate = (q) => {
    const len = q.length;
    if (len < 20)
        return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
};
export const describe = (item) => {
    return `[${item.phonetic}] ${item.explains.join(';')}`;
};
//# sourceMappingURL=utils.js.map