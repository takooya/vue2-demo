export default {
    isBlank: value => {
        if (value === undefined || value === null) {
            return true;
        }
        let result = value.replace(/^\s+|\s+$/g, '');
        return result === ''
    }
}
