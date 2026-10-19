import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow, parseISO } from "date-fns";
import { theme } from "@/constants/theme";
import { Body, ButtonText, Caption, Label, SectionHeading } from "@/components/Typography";
import { ContentFailureView, ContentLoading } from "@/components/content/ContentStatus";
import { useComments, useContentViewer, usePostComment } from "@/viewmodel/useContent";
import type { ArticleComment } from "@/services/contentService";

const authorName = (comment: ArticleComment) =>
  comment.author?.user.display_name || comment.author?.user.username || "Obaa member";

function Avatar({ comment }: { comment: ArticleComment }) {
  const uri = comment.author?.user.profile_pic;
  return (
    <View className={"w-9 h-9 rounded-full bg-[#0F969C1A] items-center justify-center overflow-hidden"}>
      {uri ? (
        <Image source={{ uri }} style={{ width: 36, height: 36 }} contentFit={"cover"} />
      ) : (
        <Label className={"text-primaryColor"}>{authorName(comment).charAt(0).toUpperCase()}</Label>
      )}
    </View>
  );
}

function CommentRow({
  comment,
  parent,
  onReply,
}: {
  comment: ArticleComment;
  parent?: ArticleComment;
  onReply?: () => void;
}) {
  return (
    <View className={"flex-row gap-3"}>
      <Avatar comment={comment} />
      <View className={"flex-1 gap-1"}>
        <View className={"flex-row items-center gap-2"}>
          <Label className={"text-mainText"}>{authorName(comment)}</Label>
          <Caption className={"text-greyColor"}>
            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
          </Caption>
        </View>
        {parent && <Caption className={"text-greyColor"}>Replying to {authorName(parent)}</Caption>}
        <Body className={"text-mainText"}>{comment.content}</Body>
        {onReply && (
          <Pressable onPress={onReply} hitSlop={8} accessibilityRole={"button"}>
            <Caption className={"text-primaryColor"}>Reply</Caption>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Composer({
  articleId,
  replyingTo,
  onClearReply,
}: {
  articleId: string;
  replyingTo: ArticleComment | null;
  onClearReply: () => void;
}) {
  const router = useRouter();
  const { signedIn, verified, email } = useContentViewer();
  const { post, isPosting } = usePostComment(articleId);
  const [text, setText] = useState("");

  if (!signedIn || !verified) {
    return (
      <Pressable
        onPress={() =>
          signedIn
            ? router.push({ pathname: "/verify-email", params: { email } })
            : router.push("/signin")
        }
        accessibilityRole={"button"}
        className={
          "bg-white border-2 border-primaryColor rounded-full h-[48px] items-center justify-center active:opacity-80"
        }
      >
        <ButtonText className={"text-primaryColor"}>
          {signedIn ? "Verify your email to comment" : "Sign in to join the conversation"}
        </ButtonText>
      </Pressable>
    );
  }

  const content = text.trim();
  const submit = async () => {
    if (!content || isPosting) return;
    if (await post(content, replyingTo?.id)) {
      setText("");
      onClearReply();
    }
  };

  return (
    <View className={"gap-2"}>
      {replyingTo && (
        <View className={"flex-row items-center self-start gap-2 bg-[#0F969C1A] rounded-full px-3 py-1"}>
          <Caption className={"text-mainText"}>Replying to {authorName(replyingTo)}</Caption>
          <Pressable
            onPress={onClearReply}
            hitSlop={8}
            accessibilityRole={"button"}
            accessibilityLabel={"Cancel reply"}
          >
            <Ionicons name={"close"} size={14} color={theme.greyColor} />
          </Pressable>
        </View>
      )}
      <View className={"flex-row items-end gap-2"}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={"Add a comment"}
          placeholderTextColor={theme.greyColor}
          multiline
          className={
            "flex-1 border border-borderGreyColor rounded-xl px-3 py-2 min-h-[44px] max-h-[120px] text-mainText font-sans"
          }
        />
        <Pressable
          onPress={submit}
          disabled={!content || isPosting}
          accessibilityRole={"button"}
          className={`bg-primaryColor rounded-full h-[44px] px-5 items-center justify-center active:opacity-80 ${!content || isPosting ? "opacity-50" : ""}`}
        >
          {isPosting ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <ButtonText className={"text-white"}>Post</ButtonText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function CommentsSection({ articleId }: { articleId: string }) {
  const { comments, isLoading, failure, retry } = useComments(articleId);
  const { verified, signedIn } = useContentViewer();
  const [replyingTo, setReplyingTo] = useState<ArticleComment | null>(null);
  const byId = new Map(comments.map((c) => [c.id, c]));

  return (
    <View className={"gap-4"}>
      <SectionHeading className={"text-mainText"}>Comments</SectionHeading>
      <Composer
        articleId={articleId}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
      />
      {isLoading ? (
        <ContentLoading />
      ) : failure ? (
        <ContentFailureView failure={failure} onRetry={retry} />
      ) : comments.length === 0 ? (
        <Body className={"text-greyColor"}>No comments yet. Be the first to share your thoughts.</Body>
      ) : (
        comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            parent={comment.replying_to ? byId.get(comment.replying_to) : undefined}
            onReply={signedIn && verified ? () => setReplyingTo(comment) : undefined}
          />
        ))
      )}
    </View>
  );
}
