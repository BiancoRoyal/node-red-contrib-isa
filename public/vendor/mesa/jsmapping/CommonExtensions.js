var CommonExtensions_Module_Factory = function () {
  var CommonExtensions = {
    name: 'CommonExtensions',
    typeInfos: [{
        localName: 'MeasureType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'MeasureType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'Decimal',
            type: 'value'
          }, {
            name: 'unitCode',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'unitCode'
            },
            type: 'attribute'
          }, {
            name: 'unitCodeListVersionID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'unitCodeListVersionID'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'NameType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'NameType'
        },
        propertyInfos: [{
            name: 'value',
            type: 'value'
          }, {
            name: 'languageID',
            typeInfo: 'Language',
            attributeName: {
              localPart: 'languageID'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'CodeType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'CodeType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'NormalizedString',
            type: 'value'
          }, {
            name: 'listID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'listID'
            },
            type: 'attribute'
          }, {
            name: 'listAgencyID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'listAgencyID'
            },
            type: 'attribute'
          }, {
            name: 'listAgencyName',
            attributeName: {
              localPart: 'listAgencyName'
            },
            type: 'attribute'
          }, {
            name: 'listName',
            attributeName: {
              localPart: 'listName'
            },
            type: 'attribute'
          }, {
            name: 'listVersionID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'listVersionID'
            },
            type: 'attribute'
          }, {
            name: 'name',
            attributeName: {
              localPart: 'name'
            },
            type: 'attribute'
          }, {
            name: 'languageID',
            typeInfo: 'Language',
            attributeName: {
              localPart: 'languageID'
            },
            type: 'attribute'
          }, {
            name: 'listURI',
            attributeName: {
              localPart: 'listURI'
            },
            type: 'attribute'
          }, {
            name: 'listSchemeURI',
            attributeName: {
              localPart: 'listSchemeURI'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'BinaryObjectType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'BinaryObjectType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'Base64Binary',
            type: 'value'
          }, {
            name: 'format',
            attributeName: {
              localPart: 'format'
            },
            type: 'attribute'
          }, {
            name: 'mimeCode',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'mimeCode'
            },
            type: 'attribute'
          }, {
            name: 'encodingCode',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'encodingCode'
            },
            type: 'attribute'
          }, {
            name: 'characterSetCode',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'characterSetCode'
            },
            type: 'attribute'
          }, {
            name: 'uri',
            attributeName: {
              localPart: 'uri'
            },
            type: 'attribute'
          }, {
            name: 'filename',
            attributeName: {
              localPart: 'filename'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'QuantityType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'QuantityType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'Decimal',
            type: 'value'
          }, {
            name: 'unitCode',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'unitCode'
            },
            type: 'attribute'
          }, {
            name: 'unitCodeListID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'unitCodeListID'
            },
            type: 'attribute'
          }, {
            name: 'unitCodeListAgencyID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'unitCodeListAgencyID'
            },
            type: 'attribute'
          }, {
            name: 'unitCodeListAgencyName',
            attributeName: {
              localPart: 'unitCodeListAgencyName'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'AmountType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'AmountType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'Decimal',
            type: 'value'
          }, {
            name: 'currencyID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'currencyID'
            },
            type: 'attribute'
          }, {
            name: 'currencyCodeListVersionID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'currencyCodeListVersionID'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'DateTimeType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'DateTimeType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'DateTime',
            type: 'value'
          }, {
            name: 'format',
            attributeName: {
              localPart: 'format'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'NumericType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'NumericType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'Decimal',
            type: 'value'
          }, {
            name: 'format',
            attributeName: {
              localPart: 'format'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'IdentifierType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'IdentifierType'
        },
        propertyInfos: [{
            name: 'value',
            typeInfo: 'NormalizedString',
            type: 'value'
          }, {
            name: 'schemeID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'schemeID'
            },
            type: 'attribute'
          }, {
            name: 'schemeName',
            attributeName: {
              localPart: 'schemeName'
            },
            type: 'attribute'
          }, {
            name: 'schemeAgencyID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'schemeAgencyID'
            },
            type: 'attribute'
          }, {
            name: 'schemeAgencyName',
            attributeName: {
              localPart: 'schemeAgencyName'
            },
            type: 'attribute'
          }, {
            name: 'schemeVersionID',
            typeInfo: 'NormalizedString',
            attributeName: {
              localPart: 'schemeVersionID'
            },
            type: 'attribute'
          }, {
            name: 'schemeDataURI',
            attributeName: {
              localPart: 'schemeDataURI'
            },
            type: 'attribute'
          }, {
            name: 'schemeURI',
            attributeName: {
              localPart: 'schemeURI'
            },
            type: 'attribute'
          }]
      }, {
        localName: 'TextType',
        typeName: {
          namespaceURI: 'http:\/\/www.mesa.org\/xml\/B2MML-V0600-AllExtensions',
          localPart: 'TextType'
        },
        propertyInfos: [{
            name: 'value',
            type: 'value'
          }, {
            name: 'languageID',
            typeInfo: 'Language',
            attributeName: {
              localPart: 'languageID'
            },
            type: 'attribute'
          }]
      }],
    elementInfos: []
  };
  return {
    CommonExtensions: CommonExtensions
  };
};
if (typeof define === 'function' && define.amd) {
  define([], CommonExtensions_Module_Factory);
}
else {
  var CommonExtensions_Module = CommonExtensions_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.CommonExtensions = CommonExtensions_Module.CommonExtensions;
  }
  else {
    var CommonExtensions = CommonExtensions_Module.CommonExtensions;
  }
}