import { ScrollView, View } from "react-native";
import { format, parseISO } from "date-fns";
import { Caption } from "@/components/Typography";
import { ContentFailureView, ContentLoading } from "@/components/content/ContentStatus";
import { RichText } from "@/components/content/RichText";
import { usePrivacyPolicy } from "@/viewmodel/useContent";

export default function PrivacyPolicyPage() {
  const { policy, isLoading, failure, retry } = usePrivacyPolicy();

  if (isLoading) return <ContentLoading />;
  if (!policy) return <ContentFailureView failure={failure ?? "unknown"} onRetry={retry} />;

  return (
    <ScrollView className={"flex-1 bg-white"} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Caption className={"text-greyColor mb-3"}>
        Last updated {format(parseISO(policy.updated_at), "d MMMM yyyy")}
      </Caption>
      <View>
        <RichText document={policy.body} />
      </View>
    </ScrollView>
  );
}
