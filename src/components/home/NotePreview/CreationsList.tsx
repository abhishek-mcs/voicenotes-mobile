import AiLoader from 'components/common/loaders/ai-loader';
import creationContent from 'utils/constants/creation-content';
import AiCreatedView from '../ai-created-view';
import { Note } from 'types';
import { useEffect } from 'react';

const CreationsList = ({note, creationLoader, createType, setLoader }:{note:Note, creationLoader:boolean, createType:string,setLoader:(v:boolean)=>void}) => {
      useEffect(()=>{
        ()=>setLoader(false)
      },[note])
      return (
        <>
          {creationLoader && (
            <AiLoader
              text={creationContent[createType]}
              style={{ marginTop: 8 }}
              size={14}
            />
          )}

          {(!!note?.creations&&note?.creations?.length>0)&&
          [...note?.creations]?.reverse()?.map((itm: any, i: number) => {
            if(!!itm?.id)
              return (
            <AiCreatedView
              id={itm?.id}
              type={itm?.type}
              date={itm?.created_at}
              content={itm?.content?.data}
              key={i}
            />
          )})}
        </>
      );
}

export default CreationsList