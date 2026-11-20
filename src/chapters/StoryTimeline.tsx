import { Scene, SceneTitle } from '../components/layout/Scene';
import { RoseMark } from '../components/ui/Ornaments';
import { GardenImage } from '../components/ui/GardenImage';
import { Reveal } from '../components/effects/Reveal';
import type { ValidatedBirthday } from '../config/schema';

export default function StoryTimeline({ config }: { config: ValidatedBirthday }) {
  return (
    <Scene className="timeline-scene">
      <SceneTitle chapter="The Golden Thread" title="The Path We Walked" subtitle={config.subtitles.timeline} />
      {config.timeline.length ? (
        <ol className="timeline-list">
          {config.timeline.map((milestone, index) => (
            <li key={`${milestone.title}-${index}`}>
              <span className="thread-node" aria-hidden="true" />
              <Reveal className="milestone">
                <p className="eyebrow">{milestone.date}</p>
                <h2>{milestone.title}</h2>
                <p>{milestone.message}</p>
                {milestone.photo && <GardenImage photo={milestone.photo} sizes="(min-width: 720px) 400px, 85vw" />}
              </Reveal>
            </li>
          ))}
        </ol>
      ) : <div className="empty-scene"><RoseMark size={54} /><p>The path is waiting for its first memory.</p></div>}
    </Scene>
  );
}
