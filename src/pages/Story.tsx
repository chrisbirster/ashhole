import * as stylex from '@stylexjs/stylex';
import { originalEight } from '../data/public';
import { s } from '../styles/site.stylex';

export default function Story() {
  return <section {...stylex.attrs(s.section)}><div {...stylex.attrs(s.sectionInner, s.storyGrid)}><div><div {...stylex.attrs(s.eyebrow)}>The origin • 1989–1991</div><h1 {...stylex.attrs(s.sectionTitle)} style="text-align:left;font-size:54px">THE STORY</h1><div {...stylex.attrs(s.storyCopy)}>
    <p {...stylex.attrs(s.storyParagraph)}>It started with a plane ride. In September 1989, Russ Ogle was flying back to Harrisburg from San Francisco when a fellow passenger described annual golf trips with friends and recommended the best place they had tried: Shenvalee Golf Resort in New Market, Virginia.</p>
    <p {...stylex.attrs(s.storyParagraph)}>Russ brought the idea to Dan Connelly and John Benedict. Before email made any of this easy, Dan arranged for eight guys to make the trip in February 1990. Shenvalee came to know them as the “Connelly Group.”</p>
    <p {...stylex.attrs(s.storyParagraph)}>The original eight were {originalEight.join(', ')}.</p>
    <p {...stylex.attrs(s.storyParagraph)}>In 1991, Dan Connelly and Roger Hanson coined the name ASHHOLE: Annual Shenvalee Hackers Holiday Of Leisurely Exercise. The outing later moved from February to a friendlier fall date and became a season-ending Classic.</p>
    <blockquote {...stylex.attrs(s.quote)}>Let us remember the good times and good friends.</blockquote>
  </div></div><div><img {...stylex.attrs(s.featureImage)} src="/assets/archive/1990/original-eight.jpg" alt="The original ASHHOLE group, 1990" /><div style="height:18px" /><img {...stylex.attrs(s.featureImage)} src="/assets/scenery/shenvalee-bg.jpg" alt="Shenvalee Golf Resort" /></div></div></section>;
}
