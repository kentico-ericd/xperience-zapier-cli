const parseString = require('xml2js').parseString;

async function getObjectSchema(z, bundle, objectType) {
    let retVal = [];
    if(!objectType) return retVal;

    function makeField(f) {
        const fieldAttrs = f['$'];
        const fieldProps = f.properties;
        let field = {
            column: fieldAttrs.column,
            columntype: fieldAttrs.columntype,
            columnsize: fieldAttrs.columnsize,
            isPK: fieldAttrs.isPK,
            allowempty: fieldAttrs.allowempty,
            visible: fieldAttrs.visible,
        };
        if(fieldProps) {
            field.fieldcaption = fieldProps[0].fieldcaption ? fieldProps[0].fieldcaption[0] : undefined,
            field.explanationtext = fieldProps[0].explanationtext ? fieldProps[0].explanationtext[0] : undefined,
            field.fielddescription = fieldProps[0].fielddescription ? fieldProps[0].fielddescription[0] : undefined
        }

        return field;
    }

    const options = {
        url: `${bundle.authData.website}/rest/cms.class/all`,
        method: 'GET',
        params: {
            where: `ClassName='${objectType}'`,
            localize: 'en-US',
            format: 'json',
            columns: 'ClassFormDefinition'
        },
        headers: {
            'Accept': 'application/json'
        }
    };

    const response = await z.request(options);
    const classes = z.JSON.parse(response.content).cms_classes;
    if(classes.length > 1) {

        const foundClass = classes[0].CMS_Class[0];
        parseString(foundClass.ClassFormDefinition, function (err, json) {
        
            const fields = json.form.field;
            retVal = fields.map(makeField);
        });
    
        // Remove PK and GUID columns
        retVal =  retVal.filter(f => !f.isPK && f.columntype !== 'guid');
    }

    return retVal;
}

module.exports = getObjectSchema;