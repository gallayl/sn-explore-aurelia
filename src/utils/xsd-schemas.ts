export const ContentTypeDefinitionXsd = `<?xml version="1.0" encoding="utf-8"?>
<xs:schema targetNamespace="http://schemas.sensenet.com/SenseNet/ContentRepository/ContentTypeDefinition"
           xmlns="http://schemas.sensenet.com/SenseNet/ContentRepository/ContentTypeDefinition"
           xmlns:tns="http://schemas.sensenet.com/SenseNet/ContentRepository/ContentTypeDefinition"
           xmlns:xs="http://www.w3.org/2001/XMLSchema" attributeFormDefault="unqualified" elementFormDefault="qualified"
>
  <xs:element name="ContentType" >
    <xs:annotation>
      <xs:documentation>Required attribute: @name, @handler. Subelement order: DisplayName, Description, Icon, Preview, AppInfo, Fields</xs:documentation>
    </xs:annotation>
    <xs:complexType>
      <xs:sequence>
        <xs:element name="DisplayName" type="xs:string" />
        <xs:element name="Description" type="xs:string" />
        <xs:element name="Icon" type="xs:string" />
        <xs:element name="Preview" type="xs:string" />
        <xs:element name="Extension" type="xs:string" />
        <xs:element name="AllowIncrementalNaming" type="xs:boolean" />
        <xs:element name="AppInfo">
          <xs:complexType mixed="true">
            <xs:sequence minOccurs="0" maxOccurs="unbounded">
              <xs:annotation>
                <xs:documentation>Extensibility point for any application. Contains any information in text or well formed xml fragment.</xs:documentation>
              </xs:annotation>
              <xs:any namespace="##any" processContents="skip" />
            </xs:sequence>
          </xs:complexType>
        </xs:element>
        <xs:element name="AllowedChildTypes" type="xs:string">
          <xs:annotation>
            <xs:documentation>
              Contains a comma, semicolon or space separated list of content type names.
            </xs:documentation>
          </xs:annotation>
        </xs:element>
        <xs:element name="AllowIndexing" type="xs:boolean" />
        <xs:element name="Fields">
          <xs:complexType>
            <xs:sequence maxOccurs="unbounded">
              <!--Fields-->
              <xs:element name="Field">
                <xs:annotation>
                  <xs:documentation>Required attributes: @name, @type or @handler.
                    Subelement order: DisplayName, Description, Icon, Preview, AppInfo, Bind, Indexing, Configuration</xs:documentation>
                </xs:annotation>
                <xs:complexType>
                  <xs:sequence>
                    <xs:element minOccurs="0" name="DisplayName" type="xs:string" />
                    <xs:element minOccurs="0" name="Description" type="xs:string" />
                    <xs:element minOccurs="0" name="Icon" type="xs:string" />
                    <xs:element minOccurs="0" name="Preview" type="xs:string" />
                    <xs:element minOccurs="0" name="Extension" type="xs:string" />
                    <xs:element minOccurs="0" name="AllowIncrementalNaming" type="xs:boolean" />
                    <xs:element minOccurs="0" name="AppInfo">
                      <xs:complexType mixed="true">
                        <xs:sequence minOccurs="0" maxOccurs="unbounded">
                          <xs:annotation>
                            <xs:documentation>Extensibility point for any application. Contains any information in text or well formed xml fragment.</xs:documentation>
                          </xs:annotation>
                          <xs:any namespace="##any" processContents="skip" />
                        </xs:sequence>
                      </xs:complexType>
                    </xs:element>
                    <xs:element name="Bind" minOccurs="0" maxOccurs="unbounded">
                      <xs:annotation>
                        <xs:documentation>Specifies a binding to a property of the given ContentHandler. The count of Bind elements and their orders are stressful. See the documentation of derived Field.</xs:documentation>
                      </xs:annotation>
                      <xs:complexType>
                        <xs:attribute name="property" type="xs:string" use="required" />
                      </xs:complexType>
                    </xs:element>
                    <xs:element name="Indexing" minOccurs="0">
                      <xs:annotation>
                        <xs:documentation>Subelement order: Mode, Store, TermVector, Analyzer, IndexHandler</xs:documentation>
                      </xs:annotation>
                      <xs:complexType>
                      <xs:sequence>
                        <xs:element name="Mode" type="IndexingModeEnum" minOccurs="0" />
                        <xs:element name="Store" type="IndexStoringEnum" minOccurs="0" />
                        <xs:element name="TermVector" type="IndexingTermVectorEnum" minOccurs="0" />
                        <xs:element name="Analyzer" type="xs:string" minOccurs="0">
                          <xs:annotation>
                            <xs:documentation>
                              Specifies a Lucene Analyzer for indexing.
                            </xs:documentation>
                          </xs:annotation>
                        </xs:element>
                        <xs:element name="IndexHandler" type="xs:string" minOccurs="0">
                          <xs:annotation>
                            <xs:documentation>Specifies an IndexHandler for indexing and parsing.</xs:documentation>
                          </xs:annotation>
                        </xs:element>
                      </xs:sequence>
                      </xs:complexType>
                    </xs:element>
                    <xs:element name="Configuration" minOccurs="0">
                      <xs:complexType mixed="true">
                        <xs:sequence minOccurs="0" maxOccurs="unbounded">
                          <xs:any namespace="##any" processContents="skip" />
                        </xs:sequence>
                        <xs:attribute name="handler" use="optional" type="xs:string">
                          <xs:annotation>
                            <xs:documentation>Contains fully qualified class name of a field handler configurator class (inherited from FieldSetting).
                              The given class overrides the default configurator of Field.</xs:documentation>
                          </xs:annotation>
                        </xs:attribute>
                      </xs:complexType>
                    </xs:element>
                  </xs:sequence>
                  <xs:attribute name="type" use="optional" type="xs:string">
                    <xs:annotation>
                      <xs:documentation>Contains short name of a field handler.</xs:documentation>
                    </xs:annotation>
                  </xs:attribute>
                  <xs:attribute name="handler" use="optional" type="xs:string">
                    <xs:annotation>
                      <xs:documentation>Contains fully qualified class name of a field handler. If @handler is specified, the @type will be neglected.</xs:documentation>
                    </xs:annotation>
                  </xs:attribute>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
      <xs:attribute name="handler" use="required" type="xs:string">
        <xs:annotation>
          <xs:documentation>Contains fully qualified class name of a content handler.</xs:documentation>
        </xs:annotation>
      </xs:attribute>
      <xs:attribute name="parentType" use="optional" type="xs:string">
        <xs:annotation>
          <xs:documentation>Contains an existing ContentType name.</xs:documentation>
        </xs:annotation>
      </xs:attribute>
    </xs:complexType>
  </xs:element>
</xs:schema>
`;
