<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <xsl:value-of select="'&#x0A;'"/>
        <xsl:apply-templates select="node()"/>
    </xsl:template>

    <xsl:template match="node()" priority="1">
        <xsl:param name="parent-XPath"/>
        <xsl:param name="parent-ShortPath"/>
        <xsl:param name="parent-LocalPath"/>
        <xsl:variable name="current-XPath" select="concat($parent-XPath, '/', name())"/>
        <xsl:variable name="current-LocalPath" select="concat($parent-LocalPath, '/', local-name())"/>
        <xsl:value-of select="concat($current-LocalPath,'&#x09;', $parent-ShortPath, '|--', local-name(), '&#x0A;')"/>
        <xsl:variable name="current-ShortPath" select="concat($parent-ShortPath, '|  ')"/>
        <xsl:if test="boolean(node() | @*)">
            <xsl:apply-templates select="node() | @*">
                <xsl:with-param name="parent-XPath" select="$current-XPath"/>
                <xsl:with-param name="parent-ShortPath" select="$current-ShortPath"/>
                <xsl:with-param name="parent-LocalPath" select="$current-LocalPath"/>
            </xsl:apply-templates>
        </xsl:if>
    </xsl:template>

    <xsl:template match="@*">
        <xsl:param name="parent-XPath"/>
        <xsl:param name="parent-ShortPath"/>
        <xsl:param name="parent-LocalPath"/>
        <xsl:if test="name()='actionCode' or name()='acknowledgeCode'">
            <xsl:value-of
                    select="concat($parent-LocalPath,'@',local-name(),'&#x09;', $parent-ShortPath, '|--@', local-name(), ' &#x0A;')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="text()" priority="2">
        <xsl:param name="parent-XPath"/>
    </xsl:template>

    <xsl:template match="comment()" priority="2">
        <xsl:param name="parent-XPath"/>
    </xsl:template>

    <xsl:template match="processing-instruction()" priority="2">
        <xsl:param name="parent-XPath"/>
    </xsl:template>

</xsl:stylesheet>

 
