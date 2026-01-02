import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const otsRecDeleted = (student: User) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText="OTS Recommendation Deleted">
            <p>The OTS recommendation for {student.fullName} has been deleted.</p>
            <p>Contact the Training Administrator for more details.</p>
            <br/>
            <p>Regards,</p>
            <p>Training Administrator</p>
            <p>ta@vzdc.org</p>
        </MultipleRecipientsEmailWrapper>
    )
}