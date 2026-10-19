import { Children, createContext, useContext, type ReactNode } from "react";
import { Linking, Text, View } from "react-native";
import {
  documentToReactComponents,
  type NodeRenderer,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS, type Document } from "@contentful/rich-text-types";
import { Body, CardTitle, PageTitle, SectionHeading } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { embeddedAsset } from "@/lib/content/image";

const ListMarkerContext = createContext<string | null>(null);
// Paragraphs inside list items and table cells sit tight against their container.
const CompactContext = createContext(false);

function openLink(uri: unknown) {
  if (typeof uri === "string") Linking.openURL(uri).catch(() => {});
}

function Paragraph({ children }: { children: ReactNode }) {
  const compact = useContext(CompactContext);
  return (
    <Body className={`text-mainText leading-[22px] ${compact ? "" : "mb-3"}`}>{children}</Body>
  );
}

function ListItem({ children }: { children: ReactNode }) {
  const marker = useContext(ListMarkerContext);
  return (
    <View className={"flex-row gap-2 mb-1"}>
      <Body className={"text-mainText leading-[22px] w-5"}>{marker}</Body>
      <CompactContext.Provider value={true}>
        <View className={"flex-1"}>{children}</View>
      </CompactContext.Provider>
    </View>
  );
}

const list =
  (marker: (index: number) => string): NodeRenderer =>
  (_node, children) => (
    <View className={"mb-3"}>
      {Children.map(children, (child, index) => (
        <ListMarkerContext.Provider value={marker(index)}>{child}</ListMarkerContext.Provider>
      ))}
    </View>
  );

const heading =
  (Component: typeof PageTitle): NodeRenderer =>
  (_node, children) => <Component className={"text-mainText mt-4 mb-2"}>{children}</Component>;

const plainText: NodeRenderer = (_node, children) => <Text>{children}</Text>;
const nothing: NodeRenderer = () => null;

const cell =
  (header: boolean): NodeRenderer =>
  (_node, children) => (
    <View
      className={`flex-1 p-2 border-r border-b border-borderGreyColor ${header ? "bg-[#0F969C1A]" : ""}`}
    >
      <CompactContext.Provider value={true}>{children}</CompactContext.Provider>
    </View>
  );

// Typed as a Record so a Contentful node type added in a library upgrade fails
// to compile instead of rendering a DOM tag, which crashes React Native.
const renderNode: Record<BLOCKS | INLINES, NodeRenderer> = {
  [BLOCKS.DOCUMENT]: (_node, children) => <View>{children}</View>,
  [BLOCKS.PARAGRAPH]: (_node, children) => <Paragraph>{children}</Paragraph>,
  [BLOCKS.HEADING_1]: heading(PageTitle),
  [BLOCKS.HEADING_2]: heading(SectionHeading),
  [BLOCKS.HEADING_3]: heading(CardTitle),
  [BLOCKS.HEADING_4]: heading(CardTitle),
  [BLOCKS.HEADING_5]: heading(CardTitle),
  [BLOCKS.HEADING_6]: heading(CardTitle),
  [BLOCKS.UL_LIST]: list(() => "•"),
  [BLOCKS.OL_LIST]: list((index) => `${index + 1}.`),
  [BLOCKS.LIST_ITEM]: (_node, children) => <ListItem>{children}</ListItem>,
  [BLOCKS.HR]: () => <View className={"h-px bg-borderGreyColor my-4"} />,
  [BLOCKS.QUOTE]: (_node, children) => (
    <View className={"border-l-4 border-primaryColor pl-3 my-2"}>{children}</View>
  ),
  [BLOCKS.TABLE]: (_node, children) => (
    <View className={"border-t border-l border-borderGreyColor rounded-lg overflow-hidden my-3"}>
      {children}
    </View>
  ),
  [BLOCKS.TABLE_ROW]: (_node, children) => <View className={"flex-row"}>{children}</View>,
  [BLOCKS.TABLE_CELL]: cell(false),
  [BLOCKS.TABLE_HEADER_CELL]: cell(true),
  [BLOCKS.EMBEDDED_ASSET]: (node) => {
    const image = embeddedAsset(node.data.target);
    if (!image?.content_type?.startsWith("image/")) return null;
    const ratio = image.width && image.height ? image.width / image.height : 16 / 9;
    return <ContentPhoto image={image} aspectRatio={ratio} className={"rounded-lg my-3"} />;
  },
  [BLOCKS.EMBEDDED_ENTRY]: nothing,
  [BLOCKS.EMBEDDED_RESOURCE]: nothing,
  [INLINES.HYPERLINK]: (node, children) => (
    <Text
      className={"text-primaryColor underline"}
      onPress={() => openLink(node.data.uri)}
      accessibilityRole={"link"}
    >
      {children}
    </Text>
  ),
  [INLINES.ASSET_HYPERLINK]: (node, children) => {
    const url = embeddedAsset(node.data.target)?.url;
    if (!url) return <Text>{children}</Text>;
    return (
      <Text
        className={"text-primaryColor underline"}
        onPress={() => openLink(url)}
        accessibilityRole={"link"}
      >
        {children}
      </Text>
    );
  },
  [INLINES.ENTRY_HYPERLINK]: plainText,
  [INLINES.RESOURCE_HYPERLINK]: plainText,
  [INLINES.EMBEDDED_ENTRY]: nothing,
  [INLINES.EMBEDDED_RESOURCE]: nothing,
};

const renderMark: Record<MARKS, (text: ReactNode) => ReactNode> = {
  [MARKS.BOLD]: (text) => <Text className={"font-sans-bold"}>{text}</Text>,
  [MARKS.ITALIC]: (text) => <Text style={{ fontStyle: "italic" }}>{text}</Text>,
  [MARKS.UNDERLINE]: (text) => <Text style={{ textDecorationLine: "underline" }}>{text}</Text>,
  [MARKS.STRIKETHROUGH]: (text) => (
    <Text style={{ textDecorationLine: "line-through" }}>{text}</Text>
  ),
  [MARKS.CODE]: (text) => <Text style={{ fontFamily: "monospace" }}>{text}</Text>,
  [MARKS.SUPERSCRIPT]: (text) => <Text>{text}</Text>,
  [MARKS.SUBSCRIPT]: (text) => <Text>{text}</Text>,
};

const options: Options = { renderNode, renderMark };

export function RichText({ document }: { document: Document | null }) {
  if (!document) return null;
  return <View>{documentToReactComponents(document, options)}</View>;
}
