export default function flattenObject(obj: NestedObject): FlattenedObject {
    let flatObject: FlattenedObject = {};

    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            const nestedKeys = flattenObject(obj[key]);
            flatObject = { ...flatObject, ...nestedKeys };
        } else {
            flatObject[`${key}`] = obj[key];
        }
    }

    return flatObject;
}
