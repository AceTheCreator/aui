
export default function Section({
    content,
    sideContent,
    stickySideContent = false
  }) {
    return (
      <>
        <section className="pb-10 border-b border-gray-200 text-lg mb-10 lg:flex">
          <div className="xl:w-prose lg:w-mprose">
            {content}
          </div>
          <div className="pl-0 pt-8 lg:pt-0 xl:pl-12 xl:pt-0 ">
            <div className={stickySideContent && 'sticky top-4'}>
              {sideContent}
            </div>
          </div>
        </section>
      </>
    )
  }