import { Component, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[ErrorBoundary] caught render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white items-center justify-center px-8">
          <SectionHeading className="text-mainText text-center mb-2">
            Something went wrong
          </SectionHeading>
          <Body className="text-subText text-center mb-8">
            Please try again. If this keeps happening, restart the app.
          </Body>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            className="bg-primaryColor rounded-full px-8 py-4 items-center"
          >
            <ButtonText className="text-white">Try again</ButtonText>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
