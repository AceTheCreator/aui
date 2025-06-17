import Section from "../../components/Section";

const content = <div>hello</div>;

export default function Operations() {
  return (
    <div className="flex justify-center w-full">
      <Section
        title="Sending a request"
        content={content}
        stickySideContent={false}
      />
    </div>
  );
}
