package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.optimization.local.TeamMemberChange;
import org.runningdinner.feedback.Feedback;
import org.runningdinner.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


@Service
public class DinnerRouteOptimizationFeedbackService {

  private final FeedbackService feedbackService;
  
  private final String receiver;
  

  public DinnerRouteOptimizationFeedbackService(FeedbackService feedbackService, @Value("${contact.mail}") String receiver) {
		super();
		this.feedbackService = feedbackService;
		this.receiver = receiver;
	}

	@Async
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
	public void sendOptimizationFeedbackAsync(String adminId, DinnerRouteOptimizationResult result, Double incomingCurrentSumDistanceInMeters, Double incomingCurrentAverageDistanceInMeters) {
  	
  	DinnerRouteListTO optimizedDinnerRouteList = result.optimizedDinnerRouteList();
  	List<TeamMemberChange> teamMemberChangesToPerform = result.teamMemberChangesToPerform();
  	
		double currentSumDistanceInMeters = incomingCurrentSumDistanceInMeters == null ? 0.0 : incomingCurrentSumDistanceInMeters;
		double currentAverageDistanceInMeters = incomingCurrentAverageDistanceInMeters == null ? 0.0 : incomingCurrentAverageDistanceInMeters;

  	Double sumNew = result.optimizedDistances().sumDistanceInMeters() == null ? 0.0 : result.optimizedDistances().sumDistanceInMeters();
  	Double averageNew = result.optimizedDistances().averageDistanceInMeters() == null ? 0.0 : result.optimizedDistances().averageDistanceInMeters();
		String newMetrics = "Sum of all distances: %.2f m, Average of all distances: %.2f m".formatted(sumNew, averageNew);
   	String currentMetrics = "Sum of all distances: %.2f m, Average of all distances: %.2f m".formatted(currentSumDistanceInMeters, currentAverageDistanceInMeters);
     	
  	String message = """
  			Route Optimization calculated for %s routes.
  			New route metrics are: %s
  			Current route metrics are: %s
  			Proposed Team member changes: %s
  			Admin-ID: %s
  			""".formatted(
					String.valueOf(optimizedDinnerRouteList.getDinnerRoutes().size()),
					newMetrics,
					currentMetrics,
  				String.valueOf(teamMemberChangesToPerform.size()),
  				adminId
				);
  	
  	Feedback feedback = new Feedback();
  	feedback.setSenderEmail(receiver);
		feedback.setMessage(message);
  	feedback.setPageName("/hostlocations");
  	feedback.setSenderIp("127.0.0.1");
  	feedback.setAdminId(adminId);
		feedbackService.createFeedback(feedback);
	}
  
}

	
