export default function (domSelectors) {
    let elements = {};

    Object.entries(domSelectors).forEach((selector) => {
        const key = selector[0];
        const data = selector[1];
        elements[key] = document.querySelector(data);
    });

    return elements;
}
